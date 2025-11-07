import React from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import { LocationsSearchAndFilter } from '../components/LocationsSearchAndFilter';
import { LocationsTable } from '../components/LocationsTable';
import { LocationFormModal } from '../components/LocationFormModal';
import { useLocations } from '../hooks/useLocations';

const MaintainLocationPage: React.FC = () => {
  const {
    locations,
    filteredLocations,
    selectedLocations,
    filters,
    locationTypes,
    isModalOpen,
    editingLocation,
    setIsModalOpen,
    setEditingLocation,
    updateFilters,
    toggleLocationSelection,
    handleAddLocation,
    handleEditLocation,
    handleDeleteMultipleLocations,
    handleSaveLocation,
  } = useLocations();

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Location Management"
          subtitle="Manage locations and related information"
        />

        <LocationsSearchAndFilter
          filters={filters}
          onFiltersChange={updateFilters}
          locationTypes={locationTypes}
        />

        <div className="flex-1 overflow-hidden">
          <LocationsTable
            locations={filteredLocations}
            selectedLocations={selectedLocations}
            onToggleSelection={toggleLocationSelection}
            onAddLocation={handleAddLocation}
            onEditLocation={handleEditLocation}
            onDeleteMultipleLocations={handleDeleteMultipleLocations}
          />
        </div>

        <LocationFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingLocation(null);
          }}
          onSave={handleSaveLocation}
          editingLocation={editingLocation}
          existingLocations={locations}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainLocationPage;
