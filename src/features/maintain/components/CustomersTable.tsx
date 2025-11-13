import React from 'react';
import { DataTableExtended, type RowAction } from '@/components/DataTableExtended';
import { Edit, Delete } from '@/assets/icons';
import type { ColumnDef } from '@tanstack/react-table';
import type { Customer } from '../types/customers';

interface CustomersTableProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customer: Customer) => void;
  displayedColumns: ColumnDef<Customer>[];
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  onEditCustomer,
  onDeleteCustomer,
  displayedColumns,
}) => {

  const rowActions: RowAction<Customer>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: row => onEditCustomer(row),
      type: 'edit',
    },
    {
      label: 'Delete',
      icon: Delete,
      onClick: row => onDeleteCustomer(row),
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
          columns={displayedColumns}
          data={customers}
          showPagination
          rowActions={rowActions}
        />
      </div>
    </div>
  );
};