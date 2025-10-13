import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import { useToast } from '@/components/ui/components/Toast/useToast';
import { LocationsSearchAndFilter } from '../components/LocationsSearchAndFilter';
import { LocationsTable } from '../components/LocationsTable';
import { LocationFormModal } from '../components/LocationFormModal';
import { useLocations } from '../hooks/useLocations';
import type { Location, LocationFormData } from '../types/locations';

const MaintainLocationPage: React.FC = () => {
  const {
    locations,
    filteredLocations,
    selectedLocations,
    filters,
    locationTypes,
    updateFilters,
    addLocation,
    updateLocation,
    deleteMultipleLocations,
    toggleLocationSelection,
  } = useLocations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { addToast } = useToast();

  const handleAddLocation = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleSaveLocation = (formData: LocationFormData) => {
    try {
      if (editingLocation) {
        updateLocation(formData);
        addToast({
          title: 'Success',
          description: 'Location updated successfully!',
          variant: 'success',
        });
      } else {
        addLocation(formData);
        addToast({
          title: 'Success',
          description: 'Location added successfully!',
          variant: 'success',
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while saving the location.',
        variant: 'error',
      });
      throw error;
    }
  };

  const handleDeleteMultipleLocations = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    if (confirm(`Are you sure you want to delete ${String(ids.length)} selected locations?`)) {
      try {
        deleteMultipleLocations(ids);
        addToast({
          title: 'Success',
          description: `${String(ids.length)} locations deleted successfully!`,
          variant: 'success',
        });
      } catch (error) {
        addToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred while deleting the locations.',
          variant: 'error',
        });
      }
    }
  };

  return (
    <SidebarHeader
      breadcrumbs={[
        { label: 'Tools' },
        { label: 'Maintain Location' },
      ]}
    >
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
            locationTypes={locationTypes}
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
          locationTypes={locationTypes}
        />
      </div>
    </SidebarHeader>
  );
};

export default MaintainLocationPage;