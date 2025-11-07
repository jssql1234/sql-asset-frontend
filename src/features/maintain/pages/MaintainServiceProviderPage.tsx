import React from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import { ServiceProviderTable } from '../components/ServiceProviderTable';
import { ServiceProviderFormModal } from '../components/ServiceProviderFormModal';
import { ServiceProviderSearchAndFilter } from '../components/ServiceProviderSearchAndFilter';
import { useServiceProvider } from '../hooks/useServiceProvider';

const MaintainServiceProviderPage: React.FC = () => {
  const {
    serviceProvider,
    filteredServiceProvider,
    selectedServiceProvider,
    filters,
    serviceProviderTypes,
    isModalOpen,
    editingServiceProvider,
    setIsModalOpen,
    setEditingServiceProvider,
    updateFilters,
    toggleServiceProviderSelection,
    handleAddServiceProvider,
    handleEditServiceProvider,
    handleDeleteMultipleServiceProvider,
    handleSaveServiceProvider,
  } = useServiceProvider();

  

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Tools' },
        { label: 'Maintain Service Provider' },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Service Provider Management"
          subtitle="Manage service provider information and configurations"
        />


        <div className="flex-1 overflow-hidden">
          <ServiceProviderSearchAndFilter
            filters={filters}
            onFiltersChange={updateFilters}
            serviceProviderTypes={serviceProviderTypes}
          />

          <ServiceProviderTable
            serviceProvider={filteredServiceProvider}
            selectedServiceProvider={selectedServiceProvider}
            onToggleSelection={toggleServiceProviderSelection}
            onAddServiceProvider={handleAddServiceProvider}
            onEditServiceProvider={handleEditServiceProvider}
            onDeleteMultipleServiceProvider={handleDeleteMultipleServiceProvider}
          />
        </div>

        <ServiceProviderFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingServiceProvider(null);
          }}
          onSave={handleSaveServiceProvider}
          editingServiceProvider={editingServiceProvider}
          existingServiceProvider={serviceProvider}
          serviceProviderTypes={serviceProviderTypes}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainServiceProviderPage;
