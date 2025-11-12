import React, { useState } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import Search from "@/components/Search";
import { LocationsTable } from '../components/LocationsTable';
import { LocationFormModal } from '../components/LocationFormModal';
import { useLocations } from '../hooks/useLocations';
import { Button } from '@/components/ui/components';
import { Plus } from '@/assets/icons';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import type { Location } from '../types/locations';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

const columnDefs = [
  {
    id: 'locationId',
    accessorKey: 'id',
    header: 'Location ID',
    cell: ({ row }: any) => <span className="font-normal">{row.original.id}</span>,
    enableColumnFilter: false,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Location',
    cell: ({ row }: any) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        {row.original.address && (
          <div className="text-sm text-onSurfaceVariant line-clamp-2">{row.original.address}</div>
        )}
      </div>
    ),
    enableColumnFilter: false,
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: ({ row }: any) => {
      const { contactPerson, contactDetails } = row.original;
      const info = [contactPerson, contactDetails].filter(Boolean).join(' • ');
      return <div className="text-sm text-onSurfaceVariant">{info || 'No contact info'}</div>;
    },
  },
];

const MaintainLocationPage: React.FC = () => {
  const {
    locations,
    filteredLocations,
    filters,
    updateFilters,
    handleSaveLocation,
    handleEditLocation,
    handleDeleteLocation,
  } = useLocations();

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<Location, unknown>({
    columns: columnDefs,
    lockedColumnIds: ['select'],
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  const handleEditLocationClick = (location: Location) => {
    handleEditLocation(location);
    setSelectedLocation(location);
    setIsFormModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedLocation(null);
    setIsFormModalOpen(true);
  };

  const handleDeleteLocationClick = (location: Location) => {
    setLocationToDelete(location);
  };

  const handleConfirmDelete = () => {
    if (locationToDelete) {
      handleDeleteLocation(locationToDelete.id);
      setLocationToDelete(null);
    }
  };

  const handleCancelDelete = () => setLocationToDelete(null);

  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setSelectedLocation(null);
  };
 
  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <TabHeader title="Location Management" subtitle="Manage locations and related information" />
          <Button
            type="button"
            onClick={handleAddClick}
            className="flex items-center gap-2 px-2.5 py-1.5 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover transition"
          >
            <Plus className="h-4 w-4" />
            Add Location
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
              searchPlaceholder="Search locations..."
              onSearch={(value) => updateFilters({ ...filters, search: value })}
              live
              className="w-80"
              inputClassName="h-10 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <LocationsTable
            locations={filteredLocations}
            onEditLocation={handleEditLocationClick}
            onDeleteLocation={handleDeleteLocationClick}
            displayedColumns={displayedColumns}
            handleColumnOrderChange={handleColumnOrderChange}
          />
        </div>

        <LocationFormModal
          isOpen={isFormModalOpen}
          onClose={handleModalClose}
          onSave={handleSaveLocation}
          editingLocation={selectedLocation}
          existingLocations={locations}
        />

        <DeleteConfirmationDialog
          isOpen={!!locationToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete location?"
          description="This will permanently remove the location. This action cannot be undone."
          confirmButtonText="Delete Location"
          itemIds={locationToDelete ? [locationToDelete.id] : []}
          itemNames={locationToDelete ? [locationToDelete.name] : []}
          itemCount={locationToDelete ? 1 : 0}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainLocationPage;
