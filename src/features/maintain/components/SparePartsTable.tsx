import { DataTable } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/components/Button';
import { Edit, Delete } from '@/assets/icons';
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
  onEditPart: (part: SparePart) => void;
  onDeletePart: (id: string) => void;
  onDeleteMultipleParts: (ids: string[]) => void;
}

export const SparePartsTable: React.FC<SparePartsTableProps> = ({
  spareParts,
  selectedParts,
  onToggleSelection,
  onEditPart,
  onDeletePart,
  onDeleteMultipleParts,
}) => {

  const columns: ColumnDef<SparePart>[] = [
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
      accessorKey: 'id',
      header: 'Part ID',
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          {row.original.id}
        </div>
      ),
    },
    {
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
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.category}</div>
      ),
    },
    {
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
    },
    {
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      cell: ({ row }) => (
        <div className="text-sm font-medium">
          {formatCurrency(row.original.unitPrice)}
        </div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Supplier',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.supplier}</div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.location}</div>
      ),
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Last Updated',
      cell: ({ row }) => (
        <div className="text-sm">{formatDate(row.original.lastUpdated)}</div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = calculateStockStatus(
          row.original.stockQty,
          row.original.lowStockThreshold,
          row.original.operationalStatus
        );

        const statusColor = status === 'In Stock' ? 'bg-green-500' :
                            status === 'Low Stock' ? 'bg-yellow-500' :
                            status === 'Out of Stock' ? 'bg-red-500' : 'bg-gray-500';

        return (
          <div className={`w-3 h-3 rounded-full ${statusColor}`} />
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onEditPart(row.original); }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { onDeletePart(row.original.id); }}
            className="h-8 w-8 p-0 text-error hover:text-error"
          >
            <Delete className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

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

  return (
    <div className="space-y-4">
      {/* Selection Actions Bar */}
      {hasSelection && (
        <div className="flex items-center justify-between p-3 bg-surfaceContainerLow rounded-lg border border-outlineVariant">
          <div className="text-sm text-onSurface">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDeleteMultipleParts(selectedParts);
              }}
              className="text-error hover:text-error"
            >
              <Delete className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                selectedParts.forEach(id => { onToggleSelection(id); });
              }}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={spareParts}
        showPagination
        enableRowClickSelection={true}
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
      />
    </div>
  );
};
