import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/components/Input';
import { Banner } from '@/components/ui/components';
import { cn } from '@/utils/utils';
import { DataTableExtended } from '@/components/DataTableExtended/DataTableExtended';
import type { ColumnDef } from '@tanstack/react-table';

export interface AssetCostAllocation {
  assetId: string;
  assetCode: string;
  assetName: string;
  allocatedCost: number;
}

interface CostDistributionProps {
  assets: Array<{ id: string; code: string; name: string }>;
  totalCost: number;
  estimatedCost?: number;
  allocations?: AssetCostAllocation[];
  onAllocationsChange: (allocations: AssetCostAllocation[]) => void;
  className?: string;
  disabled?: boolean;
}

export const CostDistribution: React.FC<CostDistributionProps> = ({
  assets,
  totalCost,
  allocations: initialAllocations,
  onAllocationsChange,
  className,
  disabled = false,
}) => {
  const [allocations, setAllocations] = useState<AssetCostAllocation[]>([]);
  const isInitialized = useRef(false);

  // Sync allocations with assets whenever assets or initialAllocations change.
  // Preserve existing allocatedCost where assetId matches, add new assets with 0,
  // and remove allocations for assets that are no longer selected.
  useEffect(() => {
    // Build a source of existing allocations to preserve values. Prefer initialAllocations
    const source = (initialAllocations && initialAllocations.length > 0) ? initialAllocations : allocations;

    // Map existing allocations by assetId for quick lookup
    const existingMap = new Map<string, AssetCostAllocation>();
    source.forEach((a) => existingMap.set(a.assetId, a));

    // Create new allocations array aligned with `assets` order
    const newAllocations: AssetCostAllocation[] = assets.map((asset) => {
      const existing = existingMap.get(asset.id);
      if (existing) {
        // Preserve allocatedCost but ensure code/name stay in sync with asset
        return {
          assetId: asset.id,
          assetCode: asset.code,
          assetName: asset.name,
          allocatedCost: Number((existing.allocatedCost ?? 0).toFixed(2)),
        };
      }
      return {
        assetId: asset.id,
        assetCode: asset.code,
        assetName: asset.name,
        allocatedCost: 0,
      };
    });

    // If assets is empty, clear allocations
    if (assets.length === 0) {
      if (allocations.length > 0) {
        setAllocations([]);
        onAllocationsChange([]);
      }
      isInitialized.current = false;
      return;
    }

    // Compare newAllocations vs current allocations to decide whether to update
    const isSame = newAllocations.length === allocations.length && newAllocations.every((na, idx) => {
      const ca = allocations[idx];
      return ca && ca.assetId === na.assetId && Math.abs(ca.allocatedCost - na.allocatedCost) < 0.001;
    });

    if (!isSame) {
      setAllocations(newAllocations);
      onAllocationsChange(newAllocations);
    }

    isInitialized.current = true;
  }, [assets, initialAllocations, allocations, onAllocationsChange]); // eslint-disable-line react-hooks/exhaustive-deps



  // Handle manual cost input for a specific asset
  const handleCostChange = useCallback((assetId: string, value: string) => {
    // Keep empty string as 0, but allow partial numbers like "3" or "3."
    const numValue = value === '' ? 0 : parseFloat(value);
    // If it's NaN (invalid number), don't update
    if (isNaN(numValue)) return;
    
    setAllocations((prevAllocations) => {
      const newAllocations = prevAllocations.map((allocation) =>
        allocation.assetId === assetId
          ? { ...allocation, allocatedCost: numValue }
          : allocation
      );
      
      // Notify parent of changes
      onAllocationsChange(newAllocations);
      return newAllocations;
    });
  }, [onAllocationsChange]);

  // Calculate total allocated cost
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedCost, 0);
  const difference = totalCost - totalAllocated;
  const isBalanced = Math.abs(difference) < 0.01; // Allow for small rounding errors

  // Custom input cell component that only updates on Enter
  const CostInputCell = ({ assetId, initialValue }: { assetId: string; initialValue: number }) => {
    const [localValue, setLocalValue] = useState(initialValue.toString());

    // Update local value when prop changes (e.g., from "Distribute Equally" button)
    useEffect(() => {
      setLocalValue(initialValue.toString());
    }, [initialValue]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const value = (e.target as HTMLInputElement).value;
        handleCostChange(assetId, value);
        (e.target as HTMLInputElement).blur(); // Optional: remove focus after Enter
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Also update on blur (when user clicks away)
      handleCostChange(assetId, e.target.value);
    };

    if (disabled) {
      return (
        <span className="text-right block w-32 ml-auto text-onSurface">
          {parseFloat(localValue).toFixed(2)}
        </span>
      );
    }

    return (
      <Input
        type="number"
        step="0.01"
        min="0"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="text-right w-32 ml-auto"
      />
    );
  };

  // Define table columns
  const columns = useMemo<ColumnDef<AssetCostAllocation>[]>(() => [
    {
      accessorKey: 'assetCode',
      header: 'Asset Code',
      cell: ({ getValue }) => (
        <span className="font-mono">{getValue() as string}</span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'assetName',
      header: 'Asset Name',
      cell: ({ getValue }) => (
        <span>{getValue() as string}</span>
      ),
      enableResizing: true,
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      accessorKey: 'allocatedCost',
      header: "Cost (RM)",
      headerAlign: 'right',
      cell: ({ row }) => (
        <CostInputCell 
          assetId={row.original.assetId}
          initialValue={row.original.allocatedCost}
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [totalCost, handleCostChange]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="title-medium font-semibold text-onSurface">
          Cost Allocation by Asset
        </h3>
        <p className="body-small text-onSurfaceVariant mt-1">
          Enter costs for each asset and press Enter to apply. Click "Distribute Equally" to allocate the actual cost evenly across all assets.
        </p>
      </div>

      {/* Allocation Table */}
      <div className=" border-outlineVariant rounded-lg overflow-hidden">
        <DataTableExtended
          columns={columns}
          data={allocations}
          showPagination={false}
          showCheckbox={false}
        />
        
        {/* Total Row */}
        <div className="border-outline bg-surfaceContainerHighest">
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <div className="col-span-2 label-large text-onSurface text-right font-semibold">
              Total Allocated:
            </div>
            <div className="label-large text-onSurface text-right font-semibold">
              {totalAllocated.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Warning */}
      {!isBalanced && totalAllocated > 0 && totalCost > 0 && (
        <Banner
          variant="error"
          title="Total Cost Allocation Mismatch with Total Cost"
          description="Please ensure the sum of allocated costs matches the total cost."
          dismissible={false}
        />
      )}
    </div>
  );
};

export default CostDistribution;
