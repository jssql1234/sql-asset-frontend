import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/components';
import { Input } from '@/components/ui/components/Input';
import SelectDropdown from '@/components/SelectDropdown';
import { type CustomColumnDef } from '@/components/ui/utils/dataTable';
import { Delete } from '@/assets/icons';
import SerialNumberSelectionModal from './SerialNumberSelectionModal';
import { DataTableExtended } from '@/components/DataTableExtended';

export interface AssetData {
  id: string;
  assetId: string;
  acquireDate: string;
  recipient: string;
  disposalValue: number;
  originalCost: number;
  disposedCost: number;
  qty: number;
  selectedSerials?: string[];
}

interface SerialNumberItem {
  serialNumber: string;
  status: 'available' | 'disposed' | 'in-use';
  location?: string;
}

interface MultipleAssetsTableProps {
  assets: AssetData[];
  disposalType: 'mfrs5' | 'partial' | 'normal';
  onAssetChange: (id: string, field: keyof AssetData, value: string | number | string[]) => void;
  onAddAsset: () => void;
  onRemoveAsset: (id: string) => void;
  availableAssetIds: string[];
  readOnly?: boolean;
  isAssetScrapped?: boolean;
  isControlledDisposal?: boolean;
}

//mock data
const getSerialNumbersForAsset = (assetId: string): SerialNumberItem[] => {
  const mockSerialNumbers: Record<string, SerialNumberItem[]> = {
    'AS-0001': [
      { serialNumber: 'SN-00001', status: 'available', location: 'Warehouse A' },
      { serialNumber: 'SN-00002', status: 'available', location: 'Warehouse A' },
      { serialNumber: 'SN-00003', status: 'available', location: 'Office B' },
      { serialNumber: 'SN-00004', status: 'available', location: 'Warehouse B' },
      { serialNumber: 'SN-00005', status: 'available', location: 'Office C' },
      { serialNumber: 'SN-00006', status: 'available', location: 'Warehouse A' },
      { serialNumber: 'SN-00007', status: 'available', location: 'Warehouse A' },
      { serialNumber: 'SN-00008', status: 'available', location: 'Office B' },
      { serialNumber: 'SN-00009', status: 'available', location: 'Warehouse A' },
      { serialNumber: 'SN-00010', status: 'available', location: 'Warehouse A' },
    ],
    'AS-0002': [
      { serialNumber: 'SN-00101', status: 'available', location: 'Warehouse A' },
      { serialNumber: 'SN-00102', status: 'available', location: 'Warehouse A' },
      { serialNumber: 'SN-00103', status: 'available', location: 'Office B' },
    ],
    'AS-0004': [
      { serialNumber: 'SN-00201', status: 'available', location: 'Warehouse C' },
      { serialNumber: 'SN-00202', status: 'available', location: 'Warehouse C' },
    ],
    'AS-0005': [
      { serialNumber: 'SN-00301', status: 'available', location: 'Office A' },
      { serialNumber: 'SN-00302', status: 'available', location: 'Office A' },
      { serialNumber: 'SN-00303', status: 'available', location: 'Office B' },
      { serialNumber: 'SN-00304', status: 'available', location: 'Office B' },
    ],
  };
  return mockSerialNumbers[assetId] || [];
};

//mock data
const getAssetDetails = (assetId: string): { acquireDate: string; originalCost: number; description?: string } => {
  const mockAssets: Record<string, { acquireDate: string; originalCost: number; description?: string }> = {
    'AS-0001': { acquireDate: '2022-01-15', originalCost: 5000, description: 'Computer' },
    'AS-0002': { acquireDate: '2022-03-20', originalCost: 3500, description: 'Printer' },
    'AS-0004': { acquireDate: '2021-06-10', originalCost: 8000, description: 'Server' },
    'AS-0005': { acquireDate: '2023-02-14', originalCost: 2500, description: 'Monitor' },
  };

  return mockAssets[assetId] || { acquireDate: '', originalCost: 0, description: undefined };
};

const MultipleAssetsTable: React.FC<MultipleAssetsTableProps> = ({
  assets,
  disposalType,
  onAssetChange,
  onAddAsset,
  onRemoveAsset,
  availableAssetIds,
  readOnly = false,
  isAssetScrapped = false,
  isControlledDisposal = false,
}) => {
  
  const [serialModalState, setSerialModalState] = useState<{
    isOpen: boolean;
    assetId: string;
    rowId: string;
  }>({
    isOpen: false,
    assetId: '',
    rowId: '',
  });

  // Get already selected asset IDs, excluding the current row being edited .
  const selectedAssetIds = useMemo(() => {
    return new Set(assets.map(asset => asset.assetId).filter(id => id !== ''));
  }, [assets]);

  const getAvailableOptionsForRow = useCallback((currentAssetId: string) => {
    return availableAssetIds
      .filter(id => {
        return !selectedAssetIds.has(id) || id === currentAssetId;
      })
      .map(id => {
        const details = getAssetDetails(id);
        const label = details.description ? `${id} - ${details.description}` : id;
        return ({ value: id, label });
      });
  }, [availableAssetIds, selectedAssetIds]);

  // Wrap cell renderers in useCallback to prevent recreation
  const recipientCell = useCallback(({ row }: { row: any }) => (
    <Input
      type="text"
      value={row.original.recipient || ''}
      onChange={(e) => {
        onAssetChange(row.original.id, 'recipient', e.target.value);
      }}
      disabled={readOnly}
      className="w-full"
      placeholder="Enter recipient"
      autoComplete="off"
    />
  ), [readOnly, onAssetChange]);

  const disposalValueCell = useCallback(({ row }: { row: any }) => (
    <Input
      type="number"
      value={isAssetScrapped ? 0 : row.original.disposalValue || ''}
      onChange={(e) => {
        if (!isAssetScrapped) {
          onAssetChange(row.original.id, 'disposalValue', parseFloat(e.target.value) || 0);
        }
      }}
      disabled={readOnly || isAssetScrapped}
      className={`w-full ${isAssetScrapped  ? 'bg-surfaceContainer cursor-not-allowed' : ''}`}
      placeholder="0.00"
      step="0.01"
      autoComplete="off"
    />
  ), [readOnly, isAssetScrapped, onAssetChange]);

  const disposedCostCell = useCallback(({ row }: { row: any }) => (
    <Input
      type="number"
      value={row.original.disposedCost || ''}
      onChange={(e) => {
        onAssetChange(row.original.id, 'disposedCost', parseFloat(e.target.value) || 0);
      }}
      disabled={readOnly}
      className="w-full"
      placeholder="0.00"
      step="0.01"
      autoComplete="off"
    />
  ), [readOnly, onAssetChange]);

  const assetIdCell = useCallback(({ row }: { row: any }) => {
    const rowOptions = getAvailableOptionsForRow(row.original.assetId);

    return (
      <SelectDropdown
        options={rowOptions}
        value={row.original.assetId || null}
        onChange={(value) => {
          if (!value) return;
          onAssetChange(row.original.id, 'assetId', value);
          onAssetChange(row.original.id, 'selectedSerials', []);
          onAssetChange(row.original.id, 'qty', 0);
          const assetDetails = getAssetDetails(value);
          onAssetChange(row.original.id, 'acquireDate', assetDetails.acquireDate);
          onAssetChange(row.original.id, 'originalCost', assetDetails.originalCost);
          if (isAssetScrapped ) {
            onAssetChange(row.original.id, 'disposalValue', 0);
            if (disposalType === 'partial' || disposalType === 'normal') {
              onAssetChange(row.original.id, 'disposedCost', 0);
            }
          }
        }}
        placeholder="Select Asset"
        disabled={readOnly}
        matchTriggerWidth
        className="w-full"
        buttonClassName="w-full"
      />
    );
  }, [getAvailableOptionsForRow, readOnly, isAssetScrapped, disposalType, onAssetChange]);

  const acquireDateCell = useCallback(({ row }: { row: any }) => (
    <Input
      type="date"
      value={row.original.acquireDate || ''}
      disabled={true}
      className="w-full bg-surfaceContainer cursor-not-allowed"
      placeholder="yyyy-mm-dd"
    />
  ), []);

  const originalCostCell = useCallback(({ row }: { row: any }) => (
    <Input
      type="number"
      value={row.original.originalCost || ''}
      disabled={true}
      className="w-full bg-surfaceContainer cursor-not-allowed"
      placeholder="0.00"
    />
  ), []);

  const qtyCell = useCallback(({ row }: { row: any }) => (
    <Input
      type="number"
      value={row.original.qty || ''}
      readOnly
      onClick={() => {
        if (!row.original.assetId) {
          alert('Please select an asset ID first');
          return;
        }
        setSerialModalState({
          isOpen: true,
          assetId: row.original.assetId,
          rowId: row.original.id,
        });
      }}
      onFocus={() => {
        // also open on focus (keyboard users)
        if (!row.original.assetId) return;
        setSerialModalState({
          isOpen: true,
          assetId: row.original.assetId,
          rowId: row.original.id,
        });
      }}
      disabled={readOnly || !row.original.assetId}
      className={`w-full cursor-pointer ${readOnly || !row.original.assetId ? '' : 'bg-surface'}`}
      placeholder="0"
      aria-label="Select serial numbers"
      title="Click to select serial numbers"
    />
  ), [readOnly]);

  const deleteCell = useCallback(({ row }: { row: any }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onRemoveAsset(row.original.id)}
      className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
    >
      <Delete className="h-4 w-4" />
    </Button>
  ), [onRemoveAsset]);


  const columns: CustomColumnDef<AssetData>[] = useMemo(() => {
    const baseColumns: CustomColumnDef<AssetData>[] = [
      {
        id: 'assetId',
        accessorKey: 'assetId',
        header: 'Asset ID',
        cell: assetIdCell,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        id: 'acquireDate',
        accessorKey: 'acquireDate',
        header: 'Acquire Date',
        cell: acquireDateCell,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        id: 'recipient',
        accessorKey: 'recipient',
        header: 'Recipient',
        cell: recipientCell,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        id: 'disposalValue',
        accessorKey: 'disposalValue',
        header: 'Disposal Value',
        cell: disposalValueCell,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        id: 'originalCost',
        accessorKey: 'originalCost',
        header: 'Original Cost',
        cell: originalCostCell,
        enableColumnFilter: false,
        enableSorting: false,
      },
    ];

    if (disposalType === 'partial' || disposalType === 'normal') {
      baseColumns.push({
        id: 'disposedCost',
        accessorKey: 'disposedCost',
        header: 'Disposed Cost',
        cell: disposedCostCell,
        enableColumnFilter: false,
        enableSorting: false,
      });
    }

    baseColumns.push({
      id: 'qty',
      accessorKey: 'qty',
      header: 'Quantity',
      cell: qtyCell,
      enableColumnFilter: false,
      enableSorting: false,
    });

    if (!readOnly) {
      baseColumns.push({
        id: 'actions',
        header: 'Actions',
        cell: deleteCell,
        enableColumnFilter: false,
        enableSorting: false,
      });
    }

    return baseColumns;
  }, [
    disposalType,
    readOnly,
    assetIdCell,
    acquireDateCell,
    recipientCell,
    disposalValueCell,
    originalCostCell,
    disposedCostCell,
    qtyCell,
    deleteCell,
  ]);

  const handleConfirmSerials = (selectedSerials: string[]) => {
    onAssetChange(serialModalState.rowId, 'selectedSerials', selectedSerials);
    onAssetChange(serialModalState.rowId, 'qty', selectedSerials.length);
  };

  const currentAsset = assets.find(a => a.id === serialModalState.rowId);
  const availableSerials = serialModalState.assetId
    ? getSerialNumbersForAsset(serialModalState.assetId)
    : [];


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-onSurface">Assets for Disposal</h4>
        {!readOnly && (
          <Button
            variant="outline"
            onClick={onAddAsset}
            className="text-sm"
            disabled={assets.some(asset => !asset.assetId || asset.qty === 0)}
          >
            Add Asset
          </Button>
        )}
      </div>

      {assets.length > 0 ? (
        // attach capture handlers on the wrapper so header pointer/touch events do not reach the DnD sensors
        <div
          className="border border-outline rounded-md overflow-hidden"
        >
          <DataTableExtended
            columns={columns}
            data={assets}
            showPagination={false}
            showCheckbox={false}
            enableRowClickSelection={false}
            className="w-full"
          />
        </div>
      ) : (
        <div className="text-center py-8 text-onSurfaceVariant border border-outline rounded-md">
          <p>No assets added yet. Click "Add Asset" to get started.</p>
        </div>
      )}

      <SerialNumberSelectionModal
        isOpen={serialModalState.isOpen}
        onClose={() => setSerialModalState({ isOpen: false, assetId: '', rowId: '' })}
        assetId={serialModalState.assetId}
        availableSerialNumbers={availableSerials}
        maxSelection={availableSerials.filter(s => s.status === 'available').length}
        onConfirm={handleConfirmSerials}
        preSelectedSerials={currentAsset?.selectedSerials || []}
      />
    </div>
  );
};

export default MultipleAssetsTable;