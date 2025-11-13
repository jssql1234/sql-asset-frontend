import React, { useState } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { Button } from '@/components/ui/components';
import { Plus } from '@/assets/icons';
import type { ColumnDef } from '@tanstack/react-table';
import type { ServiceProvider } from '../types/serviceProvider';
import { ServiceProviderTable } from '../components/ServiceProviderTable';
import { ServiceProviderFormModal } from '../components/ServiceProviderFormModal';
import { useServiceProvider } from '../hooks/useServiceProvider';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

const columnDefs: ColumnDef<ServiceProvider>[] = [
  {
    id: 'providerCode',
    accessorKey: 'code', 
    header: 'Provider Code',
    cell: ({ row }) => (
      <span className="font-normal">{row.original.code}</span>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Provider Name',
    cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const desc = row.original.description ?? '';
      const truncated = desc.length > 50 ? `${desc.slice(0, 50)}...` : desc;
      return <div className="text-sm text-onSurfaceVariant">{truncated}</div>;
    },
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: ({ row }) => {
      const { contactPerson, email, phone } = row.original;
      const details = [email, phone].filter(Boolean).join(' • ');

      return (
        <div className="text-sm text-onSurfaceVariant">
          <div className="font-medium text-onSurface">
            {contactPerson || 'N/A'}
          </div>
          {details && <div>{details}</div>}
        </div>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
];

const MaintainServiceProviderPage: React.FC = () => {
  const {
    serviceProvider,
    filteredServiceProvider,
    filters,
    serviceProviderTypes,
    editingServiceProvider,
    handleAddServiceProvider,
    handleEditServiceProvider,
    handleDeleteServiceProvider,
    handleSaveServiceProvider,
    updateFilters,
  } = useServiceProvider();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<ServiceProvider | null>(null);

  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<ServiceProvider>[]>(columnDefs);

  const handleAddClick = () => {
    handleAddServiceProvider();
    setIsModalOpen(true);
  };

  const handleEditClick = (provider: ServiceProvider) => {
    handleEditServiceProvider(provider);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (provider: ServiceProvider) => {
    setProviderToDelete(provider);
  };

  const handleConfirmDelete = () => {
    if (providerToDelete) {
      handleDeleteServiceProvider(providerToDelete.id);
      setProviderToDelete(null);
    }
  };

  const handleCancelDelete = () => setProviderToDelete(null);

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">

        <TabHeader
          title="Service Provider Management"
          subtitle="Manage service provider information and configurations"
          customActions={
            <div className="flex items-center gap-2">
              <Button type="button" onClick={handleAddClick} className="flex items-center gap-2 px-2.5 py-1.5 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover transition">
                <Plus className="h-4 w-4" />
                Add Provider
              </Button>
            </div>
          }
        />

        <div className="flex items-center gap-2 justify-between">
          <div className="relative">
            <div className="relative top-2">
              <TableColumnVisibility
                columns={columnDefs}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
              />
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <Search
              searchValue={filters.search ?? ''}
              searchPlaceholder="Search providers..."
              onSearch={(v) => updateFilters({ ...filters, search: v })}
              live
              className="w-80"
              inputClassName="h-10 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ServiceProviderTable
            serviceProvider={filteredServiceProvider}
            columns={visibleColumns}
            onEditProvider={handleEditClick}
            onDeleteProvider={handleDeleteClick}
          />
        </div>

        <ServiceProviderFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveServiceProvider}
          editingServiceProvider={editingServiceProvider}
          existingServiceProvider={serviceProvider}
          serviceProviderTypes={serviceProviderTypes}
        />

        <DeleteConfirmationDialog
          isOpen={!!providerToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete service provider?"
          description="This will permanently remove the service provider. This action cannot be undone."
          confirmButtonText="Delete Provider"
          itemIds={providerToDelete ? [providerToDelete.id] : []}
          itemNames={providerToDelete ? [providerToDelete.name] : []}
          itemCount={providerToDelete ? 1 : 0}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainServiceProviderPage;
