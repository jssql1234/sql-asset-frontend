import React, { useState } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
import { CustomersTable } from '../components/CustomersTable';
import { CustomerFormModal } from '../components/CustomersFormModal';
import { useCustomers } from '../hooks/useCustomers';
import { Button } from '@/components/ui/components';
import { Plus } from '@/assets/icons';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { useTableColumns } from '@/components/DataTableExtended';
import type { Customer } from '../types/customers';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Badge } from '@/components/ui/components/Badge';

const columnDefs = [
  {
    id: 'customerCode',
    accessorKey: 'code',
    header: 'Customer Code',
    cell: ({ row }: any) => (
      <span className="font-normal">{row.original.code}</span>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Customer Name',
    cell: ({ row }: any) => (
      <div className="font-medium">{row.original.name}</div>
    ),
  },
 {
    id: 'contact',
    header: 'Contact',
    cell: ({ row }: any) => {
      const { contactPerson, email, phone } = row.original;
      const details = [email, phone].filter(Boolean).join(' • ');

      return (
        <div className="text-sm text-onSurfaceVariant">
          <div className="font-medium text-onSurface">{contactPerson || 'N/A'}</div>
          {details && <div>{details}</div>}
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => (
      <Badge
        text={row.original.status}
        variant={row.original.status === 'Active' ? 'green' : 'grey'}
        dot={true}
      />
    ),
  },
];

const MaintainCustomerPage: React.FC = () => {
  const {
    customers,
    filteredCustomers,
    filters,
    updateFilters,
    handleSaveCustomer,
    handleEditCustomer,
    handleDeleteCustomer,
  } = useCustomers();

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<Customer, unknown>({
    columns: columnDefs,
    lockedColumnIds: [],
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const handleEditCustomerClick = (customer: Customer) => {
    handleEditCustomer(customer);
    setSelectedCustomer(customer);
    setIsFormModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedCustomer(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteCustomerClick = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      handleDeleteCustomer(customerToDelete.code);
      setCustomerToDelete(null);
    }
  };

  const handleCancelDelete = () => setCustomerToDelete(null);

  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <TabHeader title="Customer Management" subtitle="Manage customer information and relationships" />
          <Button
            type="button"
            onClick={handleAddClick}
            className="flex items-center gap-2 px-2.5 py-1.5 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover transition"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-between">
            <div className="relative">
              <div className="relative top-2">
                <TableColumnVisibility
                  columns={toggleableColumns}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={setVisibleColumns}
                />
              </div>
            </div>
          <div className="flex-1 flex justify-end">
            <Search
              searchValue={filters.search ?? ""}
              searchPlaceholder="Search customers..."
              onSearch={(value) => updateFilters({ ...filters, search: value })}
              live
              className="w-80"
              inputClassName="h-10 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <CustomersTable
            customers={filteredCustomers}
            displayedColumns={displayedColumns}
            handleColumnOrderChange={handleColumnOrderChange}
            onEditCustomer={handleEditCustomerClick}
            onDeleteCustomer={handleDeleteCustomerClick}
          />
        </div>

        <CustomerFormModal
          isOpen={isFormModalOpen}
          onClose={handleModalClose}
          onSave={handleSaveCustomer}
          editingCustomer={selectedCustomer}
          existingCustomers={customers}
        />

        <DeleteConfirmationDialog
          isOpen={!!customerToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Customer?"
          description="This will permanently remove the customer. This action cannot be undone."
          confirmButtonText="Delete Customer"
          itemIds={customerToDelete ? [customerToDelete.code] : []}
          itemNames={customerToDelete ? [customerToDelete.name] : []}
          itemCount={customerToDelete ? 1 : 0}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainCustomerPage;
