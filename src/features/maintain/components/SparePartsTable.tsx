import { useMemo, useCallback } from 'react';
import { Button, Card } from '@/components/ui/components';
import { DataTableExtended } from '@/components/DataTableExtended';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Delete, Plus } from '@/assets/icons';
import { Badge } from '@/components/ui/components/Badge';
import type { SparePart } from '../types/spareParts';
import {
  calculateStockStatus,
  formatCurrency,
  formatDate,
} from '../utils/sparePartsUtils';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import { useTableSelectionSync } from '@/components/DataTableExtended/hooks/useTableSelectionSync';

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

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<SparePart, unknown>({
    columns: columnDefs,
    lockedColumnIds: ['select'],
    onVisibleColumnsChange,
  });

  const getPartId = useCallback((part: SparePart) => part.id, []);

  const {
    rowSelection,
    handleRowSelectionChange,
    selectedCount,
    hasSelection,
    singleSelectedItem,
    clearSelection,
  } = useTableSelectionSync({
    data: spareParts,
    selectedIds: selectedParts,
    getRowId: getPartId,
    onToggleSelection,
  });

  return (
    <Card className="p-3 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TableColumnVisibility
            columns={toggleableColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
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
                onClick={() => { if (singleSelectedItem) onEditPart(singleSelectedItem); }}
                disabled={!singleSelectedItem}
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
                onClick={clearSelection}
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
        onColumnOrderChange={handleColumnOrderChange}
      />
    </Card>
  );
};
