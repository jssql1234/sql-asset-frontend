import React from 'react';
import { DataTableExtended, type RowAction } from '@/components/DataTableExtended';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Delete } from '@/assets/icons';
import type { SparePart } from '../types/spareParts';

interface SparePartsTableProps {
  spareParts: SparePart[];
  columns: ColumnDef<SparePart>[]; 
  onEditPart: (part: SparePart) => void;
  onDeletePart: (id: string) => void;
}

export const SparePartsTable: React.FC<SparePartsTableProps> = ({
  spareParts,
  columns,
  onEditPart,
  onDeletePart,
}) => {

  const rowActions: RowAction<SparePart>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => onEditPart(row),
      type: 'edit',
    },
    {
      label: 'Delete',
      icon: Delete,
      onClick: (row) => onDeletePart(row.id),
      type: 'delete',
    },
  ];

  return (
    <div>
      <style>{`
        [data-table-container] th:last-child {
          background-color: var(--color-surface-container);
        }
      `}</style>

      <div data-table-container>
        <DataTableExtended
          columns={columns}
          data={spareParts}
          showPagination
          rowActions={rowActions}
        />
      </div>
    </div>
  );
};