import React, { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import Search from '@/components/Search';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { Button } from '@/components/ui/components';
import { Plus } from '@/assets/icons';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import type { ColumnDef } from '@tanstack/react-table';
import type { ServiceProvider } from '../types/serviceProvider';
import { ServiceProviderTable } from '../components/ServiceProviderTable';
import { ServiceProviderFormModal } from '../components/ServiceProviderFormModal';
import { useServiceProvider } from '../hooks/useServiceProvider';

const columnDefs: ColumnDef<ServiceProvider>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Provider Name',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-onSurfaceVariant">
          Code: {row.original.code}
        </div>
      </div>
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
    id: 'contactPerson',
    accessorKey: 'contactPerson',
    header: 'Contact Person',
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: 'Phone',
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
    handleDeleteMultipleServiceProvider,
    handleSaveServiceProvider,
    updateFilters,
  } = useServiceProvider();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Table column control
  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<ServiceProvider, unknown>({
    columns: columnDefs,
    lockedColumnIds: [],
  });

  // Initialize defaults
  useEffect(() => {
    if (visibleColumns.length === 0) {
      setVisibleColumns(toggleableColumns);
    }
  }, [visibleColumns, toggleableColumns, setVisibleColumns]);

  const handleAddClick = () => {
    handleAddServiceProvider();
    setIsModalOpen(true);
  };

  const handleEditClick = (provider: ServiceProvider) => {
    handleEditServiceProvider(provider);
    setIsModalOpen(true);
  };

  // Convert single delete to multi-delete API
  const handleDeleteSingle = useCallback(
    (provider: ServiceProvider) => {
      if (!provider?.id) return;
      handleDeleteMultipleServiceProvider([provider.id]);
    },
    [handleDeleteMultipleServiceProvider]
  );

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">

        <TabHeader
          title="Service Provider Management"
          subtitle="Manage service provider information and configurations"
          customActions={
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleAddClick} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Provider
              </Button>
            </div>
          }
        />

        <div className="flex items-center gap-2 justify-between">

          <TableColumnVisibility
            columns={toggleableColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />

          <div className="flex-1 flex justify-end">
            <Search
              searchValue={filters.search ?? ''}
              searchPlaceholder="Search providers..."
              onSearch={(v) => updateFilters({ ...filters, search: v })}
              live
              className="max-w-md"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ServiceProviderTable
            serviceProvider={filteredServiceProvider}
            columns={displayedColumns}
            onEditProvider={handleEditClick}
            onDeleteProvider={handleDeleteSingle}
            onColumnOrderChange={handleColumnOrderChange}
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
      </div>
    </AppLayout>
  );
};

export default MaintainServiceProviderPage;
