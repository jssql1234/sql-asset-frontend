import React, { useMemo, useCallback } from 'react';
import { Button, Card } from '@/components/ui/components';
import { DataTableExtended } from '@/components/DataTableExtended';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Delete, Plus } from '@/assets/icons';
import type { Customer } from '../types/customers';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import { useTableSelectionSync } from '@/components/DataTableExtended/hooks/useTableSelectionSync';
import { Badge } from '@/components/ui/components/Badge';

interface CustomersTableProps {
  customers: Customer[];
  selectedCustomers: string[];
  onToggleSelection: (id: string) => void;
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteMultipleCustomers: (ids: string[]) => void;
}

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  selectedCustomers,
  onToggleSelection,
  onAddCustomer,
  onEditCustomer,
  onDeleteMultipleCustomers,
}) => {
  const columnDefs: ColumnDef<Customer>[] = useMemo(() => ([
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
      id: 'name',
      accessorKey: 'name',
      header: 'Customer Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">Code: {row.original.code}</div>
        </div>
      ),
    },
    {
      id: 'contactPerson',
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.contactPerson || 'N/A'}</span>
      ),
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-onSurfaceVariant">{row.original.email || 'N/A'}</span>
      ),
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-sm text-onSurfaceVariant">{row.original.phone || 'N/A'}</span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          text={row.original.status}
          variant={row.original.status === 'Active' ? 'green' : 'grey'}
          dot={true}
        />
      ),
    },
  ]), []);

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<Customer, unknown>({
    columns: columnDefs,
    lockedColumnIds: ['select'],
  });

  const getCustomerCode = useCallback((customer: Customer) => customer.code, []);

  const {
    rowSelection,
    handleRowSelectionChange,
    selectedCount,
    hasSelection,
    singleSelectedItem,
    clearSelection,
  } = useTableSelectionSync({
    data: customers,
    selectedIds: selectedCustomers,
    getRowId: getCustomerCode,
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
            onClick={onAddCustomer}
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
                onClick={() => { if (singleSelectedItem) onEditCustomer(singleSelectedItem); }}
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
                onClick={() => { onDeleteMultipleCustomers(selectedCustomers); }}
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
        data={customers}
        showPagination
        enableRowClickSelection
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
        onColumnOrderChange={handleColumnOrderChange}
      />
    </Card>
  );
};