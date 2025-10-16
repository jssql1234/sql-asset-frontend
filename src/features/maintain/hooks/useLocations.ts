import { useState, useEffect, useCallback } from 'react';
import type {
  Location,
  LocationFormData,
  LocationsFilters,
  LocationTypeOption,
} from '../types/locations';
import {
  createLocationFromForm,
  filterLocations,
  generateLocationId,
  validateLocationForm,
} from '../utils/locationUtils';
import { useToast } from '@/components/ui/components/Toast';

const LOCATIONS_STORAGE_KEY = 'maintain_locations_data';
const LOCATION_TYPES_STORAGE_KEY = 'maintain_location_types_data';

const sampleLocationTypes: LocationTypeOption[] = [
  { id: 'WH', name: 'Warehouse' },
  { id: 'PR', name: 'Production Floor' },
  { id: 'ST', name: 'Storage' },
  { id: 'OF', name: 'Office' },
  { id: 'OT', name: 'Outdoor' },
];

const sampleLocations: Location[] = [
  {
    id: 'LOC001',
    name: 'Warehouse A',
    address: 'Main warehouse complex, Section A',
    categoryId: 'WH',
    contactPerson: 'Anita Tan',
    contactDetails: '+60 12-3456 789',
    createdAt: '2025-07-15T08:30:00.000Z',
    updatedAt: '2025-07-15T08:30:00.000Z',
  },
  {
    id: 'LOC002',
    name: 'Production Floor B',
    address: 'Main production facility, Floor B',
    categoryId: 'PR',
    contactPerson: 'Hafiz Rahman',
    contactDetails: '+60 16-2222 333',
    createdAt: '2025-07-18T11:00:00.000Z',
    updatedAt: '2025-07-18T11:00:00.000Z',
  },
  {
    id: 'LOC003',
    name: 'Storage Room C',
    address: 'Storage facility, Section C',
    categoryId: 'ST',
    contactPerson: 'Emily Chen',
    contactDetails: '+60 19-8888 111',
    createdAt: '2025-07-22T13:45:00.000Z',
    updatedAt: '2025-07-22T13:45:00.000Z',
  },
  {
    id: 'LOC004',
    name: 'Office Building D',
    address: 'Administrative offices, Building D',
    categoryId: 'OF',
    contactPerson: 'Siti Rahim',
    contactDetails: '+60 13-9876 543',
    createdAt: '2025-08-02T09:15:00.000Z',
    updatedAt: '2025-08-02T09:15:00.000Z',
  },
  {
    id: 'LOC005',
    name: 'Outdoor Storage',
    address: 'Outdoor storage yard, Section E',
    categoryId: 'OT',
    contactPerson: 'Noor Aisyah',
    contactDetails: '+60 12-7654 321',
    createdAt: '2025-08-10T10:20:00.000Z',
    updatedAt: '2025-08-10T10:20:00.000Z',
  },
];

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState<LocationsFilters>({
    search: '',
    categoryId: '',
  });
  const [locationTypes, setLocationTypes] = useState<LocationTypeOption[]>(sampleLocationTypes);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const initialize = () => {
      try {
        const storedLocations = typeof window !== 'undefined'
          ? window.localStorage.getItem(LOCATIONS_STORAGE_KEY)
          : null;
        const storedTypes = typeof window !== 'undefined'
          ? window.localStorage.getItem(LOCATION_TYPES_STORAGE_KEY)
          : null;

        let initialLocations = sampleLocations;
        let initialTypes = sampleLocationTypes;

        if (storedLocations) {
          const parsedLocations = JSON.parse(storedLocations) as Location[];
          if (Array.isArray(parsedLocations)) {
            initialLocations = parsedLocations;
          }
        } else if (typeof window !== 'undefined') {
          window.localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(sampleLocations));
        }

        if (storedTypes) {
          const parsedTypes = JSON.parse(storedTypes) as LocationTypeOption[];
          if (Array.isArray(parsedTypes) && parsedTypes.length > 0) {
            initialTypes = parsedTypes;
          }
        } else if (typeof window !== 'undefined') {
          window.localStorage.setItem(LOCATION_TYPES_STORAGE_KEY, JSON.stringify(sampleLocationTypes));
        }

        setLocationTypes(initialTypes);
        setLocations(initialLocations);
        setFilteredLocations(filterLocations(initialLocations, '', '', initialTypes));
        setIsLoading(false);
      } catch (initializationError) {
        console.error('Error initializing locations data:', initializationError);
        setLocationTypes(sampleLocationTypes);
        setLocations(sampleLocations);
        setFilteredLocations(sampleLocations);
        setIsLoading(false);
        setError('Failed to load locations data');
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (locationTypes.length === 0) {
      setFilteredLocations([]);
      return;
    }

    const filtered = filterLocations(locations, filters.search, filters.categoryId, locationTypes);
    setFilteredLocations(filtered);
  }, [locations, filters, locationTypes]);

  const updateFilters = useCallback((newFilters: Partial<LocationsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const persistLocations = useCallback((nextLocations: Location[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(nextLocations));
    }
  }, []);

  const persistLocationTypes = useCallback((nextTypes: LocationTypeOption[]) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCATION_TYPES_STORAGE_KEY, JSON.stringify(nextTypes));
    }
  }, []);

  const isDuplicateId = useCallback((id: string, ignoreId?: string) => {
    return locations.some(location => location.id === id && location.id !== ignoreId);
  }, [locations]);

  const addLocation = useCallback((formData: LocationFormData) => {
    const validationErrors = validateLocationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    if (isDuplicateId(formData.id)) {
      throw new Error('Location ID already exists');
    }

    const newLocation = createLocationFromForm(formData);
    const nextLocations = [...locations, newLocation];
    setLocations(nextLocations);
    persistLocations(nextLocations);

    return newLocation;
  }, [isDuplicateId, locations, persistLocations]);

  const updateLocation = useCallback((formData: LocationFormData) => {
    const validationErrors = validateLocationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    if (isDuplicateId(formData.id, formData.id)) {
      throw new Error('Location ID already exists');
    }

    setLocations(prevLocations => {
      const nextLocations = prevLocations.map(location =>
        location.id === formData.id ? createLocationFromForm(formData, location) : location
      );
      persistLocations(nextLocations);
      return nextLocations;
    });
  }, [isDuplicateId, persistLocations]);

  const deleteMultipleLocations = useCallback((ids: string[]) => {
    setLocations(prevLocations => {
      const nextLocations = prevLocations.filter(location => !ids.includes(location.id));
      persistLocations(nextLocations);
      return nextLocations;
    });
    setSelectedLocations(prev => prev.filter(id => !ids.includes(id)));
  }, [persistLocations]);

  const toggleLocationSelection = useCallback((id: string) => {
    setSelectedLocations(prev =>
      prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocations([]);
  }, []);

  const getLocationById = useCallback((id: string) => {
    return locations.find(location => location.id === id);
  }, [locations]);

  const resetToSampleData = useCallback(() => {
    setLocations(sampleLocations);
    setLocationTypes(sampleLocationTypes);
    setSelectedLocations([]);
    setFilters({ search: '', categoryId: '' });
    persistLocations(sampleLocations);
    persistLocationTypes(sampleLocationTypes);
  }, [persistLocations, persistLocationTypes]);

  const exportData = useCallback(() => {
    const payload = {
      locations,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `locations_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [locations]);

  const getNewLocationId = useCallback(() => generateLocationId(locations), [locations]);

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

  return {
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

    // Unused exports?
    isLoading,
    error,
    clearSelection,
    getLocationById,
    resetToSampleData,
    exportData,
    getNewLocationId,
  };
}
