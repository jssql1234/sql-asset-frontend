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
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import type { Customer } from '../types/customers';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Badge } from '@/components/ui/components/Badge';

const columnDefs = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Customer Name',
    cell: ({ row }: any) => (
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
    cell: ({ row }: any) => row.original.contactPerson || 'N/A',
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }: any) => row.original.email || 'N/A',
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }: any) => row.original.phone || 'N/A',
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
    editingCustomer,
    updateFilters,
    handleSaveCustomer,
    handleDeleteMultipleCustomers,
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

  const [modals, setModals] = useState({ editCustomer: false });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const handleEditCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModals((prev) => ({ ...prev, editCustomer: true }));
  };

  const handleDeleteCustomerClick = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      handleDeleteMultipleCustomers([customerToDelete.code]);
      setCustomerToDelete(null);
    }
  };

  const handleCancelDelete = () => setCustomerToDelete(null);

  const handleModalClose = (modalKey: "editCustomer") => {
    setModals((prev) => ({ ...prev, [modalKey]: false }));
    if (modalKey === "editCustomer") setSelectedCustomer(null);
  };

  return (
    <AppLayout breadcrumbs={[{ label: 'Tools' }, { label: 'Maintain Customer' }]}>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <TabHeader title="Customer Management" subtitle="Manage customer information and relationships" />
          <Button
            size="sm"
            onClick={() => {
              setSelectedCustomer(null);
              setModals((prev) => ({ ...prev, editCustomer: true }));
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <TableColumnVisibility
              columns={toggleableColumns}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
            />
          </div>
          <div className="flex-1 flex justify-end">
            <Search
              searchValue={filters.search ?? ""}
              searchPlaceholder="Search customers..."
              onSearch={(value) => updateFilters({ ...filters, search: value })}
              live
              className="max-w-md"
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
          isOpen={modals.editCustomer}
          onClose={() => handleModalClose("editCustomer")}
          onSave={handleSaveCustomer}
          editingCustomer={selectedCustomer ?? editingCustomer}
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
