import React from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import { CustomersSearchAndFilter } from '../components/CustomersSearchAndFilter';
import { CustomersTable } from '../components/CustomersTable';
import { CustomerFormModal } from '../components/CustomersFormModal';
import { useCustomers } from '../hooks/useCustomers';

const MaintainCustomerPage: React.FC = () => {
  const {
    customers,
    filteredCustomers,
    selectedCustomers,
    filters,
    isModalOpen,
    editingCustomer,
    setIsModalOpen,
    setEditingCustomer,
    updateFilters,
    toggleCustomerSelection,
    handleAddCustomer,
    handleEditCustomer,
    handleDeleteMultipleCustomers,
    handleSaveCustomer,
  } = useCustomers();

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain Customer" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Customer Management"
          subtitle="Manage customer information and relationships"
        />

        <CustomersSearchAndFilter
          filters={filters}
          onFiltersChange={updateFilters}
        />

        <div className="flex-1 overflow-hidden">
          <CustomersTable
            customers={filteredCustomers}
            selectedCustomers={selectedCustomers}
            onToggleSelection={toggleCustomerSelection}
            onAddCustomer={handleAddCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteMultipleCustomers={handleDeleteMultipleCustomers}
          />
        </div>

        <CustomerFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
          editingCustomer={editingCustomer}
          existingCustomers={customers}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainCustomerPage;
