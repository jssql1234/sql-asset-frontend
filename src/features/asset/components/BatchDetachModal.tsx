import { useState } from 'react';
import { DataTableExtended } from '@/components/DataTableExtended';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/DialogExtended';
import { Button } from '@/components/ui/components';
import type { Asset } from '@/types/asset';
import { type CustomColumnDef } from '@/components/ui/utils/dataTable';

interface BatchDetachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchAssets: Asset[];
  numToDetach: number;
  onConfirm: (selectedIds: string[]) => void;
}

const simpleColumns: CustomColumnDef<Asset>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'Asset ID',
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Asset Name',
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : '-';
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    id: 'cost',
    accessorKey: 'cost',
    header: 'Cost',
    cell: ({ getValue }) => {
      const value = getValue() as number;
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return '-';
      }

      return `RM ${value.toLocaleString()}`;
    },
    enableSorting: false,
    enableColumnFilter: false,
  },
];

export default function BatchDetachModal({ open, onOpenChange, batchAssets, numToDetach, onConfirm }: BatchDetachModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const requiredSelectionLabel = String(numToDetach);

  const handleSelectionChange = (rows: Asset[]) => {
    setSelectedIds(rows.map(row => row.id));
  };

  const handleConfirm = () => {
    if (selectedIds.length === numToDetach) {
      onConfirm(selectedIds);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {`Select ${requiredSelectionLabel} assets to detach from batch`}
          </DialogTitle>
          <DialogDescription>
            {`Choose exactly ${requiredSelectionLabel} assets to remove from the batch. These assets will no longer be associated with the batch ID.`}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-auto mb-4">
          <DataTableExtended
            columns={simpleColumns}
            data={batchAssets}
            showCheckbox
            enableRowClickSelection
            onRowSelectionChange={handleSelectionChange}
            showPagination={false}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={selectedIds.length !== numToDetach}
            onClick={handleConfirm}
          >
            Detach {requiredSelectionLabel} Assets
          </Button>
        </div>
        {selectedIds.length !== numToDetach && (
          <p className="text-sm text-destructive mt-2">
            Please select exactly {requiredSelectionLabel} assets to proceed.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
