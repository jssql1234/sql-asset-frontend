import { useEffect, useMemo, useState, useCallback } from 'react';
import { Button, Card } from '@/components/ui/components';
import { DataTableExtended } from '@/components/DataTableExtended';
import { TableColumnVisibility } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Delete, Plus } from '@/assets/icons';
import { Badge } from '@/components/ui/components/Badge';
import type { SparePart } from '../types/spareParts';
import {
  calculateStockStatus,
  formatCurrency,
  formatDate,
} from '../utils/sparePartsUtils';

interface SparePartsTableProps {
  spareParts: SparePart[];
  selectedParts: string[];
  onToggleSelection: (id: string) => void;
  onAddPart: () => void;
  onEditPart: (part: SparePart) => void;
  onDeleteMultipleParts: (ids: string[]) => void;
  onVisibleColumnsChange?: (visible: ColumnDef<SparePart>[]) => void;
}

export const SparePartsTable: React.FC<SparePartsTableProps> = ({
  spareParts,
  selectedParts,
  onToggleSelection,
  onAddPart,
  onEditPart,
  onDeleteMultipleParts,
  onVisibleColumnsChange,
}) => {

  const columnDefs: ColumnDef<SparePart>[] = useMemo(() => ([
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-outlineVariant text-primary focus:ring-primary"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-outlineVariant text-primary focus:ring-primary"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'partId',
      accessorKey: 'id',
      header: 'Part ID',
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          {row.original.id}
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">
            {row.original.description}
          </div>
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'category',
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.category}</div>
      ),
    },
    {
      id: 'stockQty',
      accessorKey: 'stockQty',
      header: 'Stock Qty',
      cell: ({ row }) => {
        const stockQty = row.original.stockQty;
        const threshold = row.original.lowStockThreshold;
        const isLow = stockQty <= threshold;

        return (
          <div className={`text-sm font-medium ${isLow ? 'text-warning' : ''}`}>
            {stockQty}
          </div>
        );
      },
      enableColumnFilter: false,
    },
    {
      id: 'unitPrice',
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {formatCurrency(row.original.unitPrice)}
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'supplier',
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.supplier}</div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'location',
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.location}</div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'lastUpdated',
      accessorKey: 'lastUpdated',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.original.lastUpdated)}</div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'status',
      accessorFn: (row) => calculateStockStatus(
        row.stockQty,
        row.lowStockThreshold,
        row.operationalStatus
      ),
      header: 'Status',
      cell: ({ row }) => {
        const rawStatus = row.getValue('status');
        const status = typeof rawStatus === 'string' && rawStatus.length > 0 ? rawStatus : 'Unknown';

        const variant = status === 'In Stock'
          ? 'green'
          : status === 'Low Stock'
            ? 'yellow'
            : status === 'Out of Stock'
              ? 'red'
              : 'grey';

        return (
          <Badge
            text={status.toUpperCase()}
            variant={variant}
            className="h-6 px-3 uppercase font-semibold tracking-wide"
          />
        );
      },
      enableColumnFilter: true,
    },
  ]), []);

  const selectionColumn = useMemo(
    () => columnDefs.find(column => column.id === 'select'),
    [columnDefs],
  );

  const visibilityColumns = useMemo(
    () => columnDefs.filter(column => column.id !== 'select'),
    [columnDefs],
  );

  const [visibleColumns, setVisibleColumns] = useState(visibilityColumns);

  const handleSetVisibleColumns = useCallback((newVisible: React.SetStateAction<ColumnDef<SparePart>[]>) => {
    setVisibleColumns(prev => {
      const updated = typeof newVisible === 'function' ? newVisible(prev) : newVisible;
      onVisibleColumnsChange?.(updated);
      return updated;
    });
  }, [onVisibleColumnsChange]);

  useEffect(() => {
    const initialVisible = visibilityColumns;
    setVisibleColumns(initialVisible);
    onVisibleColumnsChange?.(initialVisible);
  }, [visibilityColumns, onVisibleColumnsChange]);

  const displayedColumns = useMemo(() => {
    const cols: ColumnDef<SparePart>[] = [];
    if (selectionColumn) {
      cols.push(selectionColumn);
    }
    cols.push(...visibleColumns);
    return cols;
  }, [selectionColumn, visibleColumns]);

  const handleRowSelectionChange = (
    selectedRows: SparePart[],
  ) => {
    const selectedIds = new Set(selectedRows.map(part => part.id));

    selectedIds.forEach(id => {
      if (!selectedParts.includes(id)) {
        onToggleSelection(id);
      }
    });

    selectedParts.forEach(id => {
      if (!selectedIds.has(id)) {
        onToggleSelection(id);
      }
    });
  };

  const selectedCount = selectedParts.length;
  const hasSelection = selectedCount > 0;
  const rowSelection = selectedParts.reduce<Record<string, boolean>>((acc, partId) => {
    const index = spareParts.findIndex(part => part.id === partId);
    if (index !== -1) {
      acc[index.toString()] = true;
    }
    return acc;
  }, {});

  const selectedPartForEdit = useMemo(() => {
    if (selectedParts.length === 1) {
      return spareParts.find(part => part.id === selectedParts[0]);
    }
    return undefined;
  }, [selectedParts, spareParts]);

  return (
    <Card className="p-3 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TableColumnVisibility
            columns={visibilityColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={handleSetVisibleColumns}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onAddPart}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
          {hasSelection && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { if (selectedPartForEdit) onEditPart(selectedPartForEdit); }}
                disabled={!selectedPartForEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDeleteMultipleParts(selectedParts);
                }}
                className="flex items-center gap-2"
              >
                <Delete className="h-4 w-4" />
                Delete Selected
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  selectedParts.forEach(id => { onToggleSelection(id); });
                }}
              >
                Clear Selection
              </Button>
              <div className="body-small text-onSurfaceVariant">
                {selectedCount} selected
              </div>
            </>
          )}
        </div>
      </div>

      <DataTableExtended
        columns={displayedColumns}
        data={spareParts}
        showPagination
        enableRowClickSelection={true}
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
      />
    </Card>
  );
};
