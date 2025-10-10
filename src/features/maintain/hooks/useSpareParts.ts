import { useState, useEffect, useCallback } from 'react';
import type {
  SparePart,
  SparePartsState,
  SparePartsFilters,
  SparePartFormData,
} from '../types/spareParts';
import {
  filterSpareParts,
  isDuplicateSparePartId,
  createSparePartFromForm,
  validateSparePartForm
} from '../utils/sparePartsUtils';

// Sample data for initial development
const sampleSpareParts: SparePart[] = [
  {
    id: 'SP001',
    name: 'Engine Oil Filter',
    description: 'Engine Oil Filter for Diesel Engines',
    category: 'Filters',
    stockQty: 15,
    lowStockThreshold: 10,
    unitPrice: 25.50,
    supplier: 'AutoParts Inc',
    location: 'A-01-15',
    lastUpdated: '2025-07-20',
    operationalStatus: 'Active'
  },
  {
    id: 'SP002',
    name: 'Brake Pads Set',
    description: 'Ceramic Brake Pads Set',
    category: 'Brakes',
    stockQty: 8,
    lowStockThreshold: 12,
    unitPrice: 125.00,
    supplier: 'BrakeMaster',
    location: 'B-02-08',
    lastUpdated: '2025-07-18',
    operationalStatus: 'Active'
  },
  {
    id: 'SP003',
    name: 'Hydraulic Hose',
    description: 'Hydraulic Hose 3/4 inch, 10ft',
    category: 'Hydraulics',
    stockQty: 25,
    lowStockThreshold: 15,
    unitPrice: 45.75,
    supplier: 'HydroTech',
    location: 'C-03-12',
    lastUpdated: '2025-07-22',
    operationalStatus: 'Active'
  },
  {
    id: 'SP004',
    name: 'Air Filter',
    description: 'Air Filter for Heavy Machinery',
    category: 'Filters',
    stockQty: 12,
    lowStockThreshold: 8,
    unitPrice: 35.20,
    supplier: 'Industrial Parts Co',
    location: 'A-02-10',
    lastUpdated: '2025-08-15',
    operationalStatus: 'Active'
  },
  {
    id: 'SP005',
    name: 'Bearing Assembly',
    description: 'Bearing Assembly for Conveyor',
    category: 'Mechanical',
    stockQty: 5,
    lowStockThreshold: 7,
    unitPrice: 89.00,
    supplier: 'Bearing Supply Ltd',
    location: 'C-01-05',
    lastUpdated: '2025-08-10',
    operationalStatus: 'Active'
  }
];

export function useSpareParts() {
  const [state, setState] = useState<SparePartsState>({
    spareParts: [],
    filteredSpareParts: [],
    selectedSpareParts: [],
    filters: {
      search: '',
      category: '',
      status: ''
    },
    isLoading: true,
    error: null
  });

  // Initialize data
  useEffect(() => {
    const initializeData = () => {
      try {
        // Load from localStorage or use sample data
        const storedData = localStorage.getItem('sparePartsData');
        let spareParts: SparePart[] = [];

        if (storedData) {
          spareParts = JSON.parse(storedData) as SparePart[];
        } else {
          spareParts = sampleSpareParts;
          localStorage.setItem('sparePartsData', JSON.stringify(spareParts));
        }

        setState(prevState => ({
          ...prevState,
          spareParts,
          filteredSpareParts: spareParts,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error loading spare parts data:', error);
        setState(prevState => ({
          ...prevState,
          spareParts: sampleSpareParts,
          filteredSpareParts: sampleSpareParts,
          isLoading: false,
          error: 'Failed to load data'
        }));
      }
    };

    initializeData();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    const filtered = filterSpareParts(
      state.spareParts,
      state.filters.search,
      state.filters.category,
      state.filters.status
    );

    setState(prevState => ({
      ...prevState,
      filteredSpareParts: filtered
    }));
  }, [state.filters, state.spareParts]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SparePartsFilters>) => {
    setState(prevState => ({
      ...prevState,
      filters: { ...prevState.filters, ...newFilters }
    }));
  }, []);

  // Add new spare part
  const addSparePart = useCallback((formData: SparePartFormData) => {
    // Validate form data
    const validationErrors = validateSparePartForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    // Check for duplicate ID
    if (isDuplicateSparePartId(state.spareParts, formData.id)) {
      throw new Error('Part ID already exists');
    }

    const newSparePart = createSparePartFromForm(formData);

    setState(prevState => {
      const updatedSpareParts = [...prevState.spareParts, newSparePart];
      localStorage.setItem('sparePartsData', JSON.stringify(updatedSpareParts));

      return {
        ...prevState,
        spareParts: updatedSpareParts
      };
    });

    return newSparePart;
  }, [state.spareParts]);

  // Update existing spare part
  const updateSparePart = useCallback((formData: SparePartFormData) => {
    // Validate form data
    const validationErrors = validateSparePartForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    // Check for duplicate ID (excluding current item)
    if (isDuplicateSparePartId(state.spareParts, formData.id, formData.id)) {
      throw new Error('Part ID already exists');
    }

    const updatedSparePart = createSparePartFromForm(formData);

    setState(prevState => {
      const updatedSpareParts = prevState.spareParts.map(part =>
        part.id === formData.id ? updatedSparePart : part
      );
      localStorage.setItem('sparePartsData', JSON.stringify(updatedSpareParts));

      return {
        ...prevState,
        spareParts: updatedSpareParts
      };
    });

    return updatedSparePart;
  }, [state.spareParts]);

  // Delete spare part
  const deleteSparePart = useCallback((id: string) => {
    setState(prevState => {
      const updatedSpareParts = prevState.spareParts.filter(part => part.id !== id);
      localStorage.setItem('sparePartsData', JSON.stringify(updatedSpareParts));

      return {
        ...prevState,
        spareParts: updatedSpareParts,
        selectedSpareParts: prevState.selectedSpareParts.filter(selectedId => selectedId !== id)
      };
    });
  }, []);

  // Delete multiple spare parts
  const deleteMultipleSpareParts = useCallback((ids: string[]) => {
    setState(prevState => {
      const updatedSpareParts = prevState.spareParts.filter(part => !ids.includes(part.id));
      localStorage.setItem('sparePartsData', JSON.stringify(updatedSpareParts));

      return {
        ...prevState,
        spareParts: updatedSpareParts,
        selectedSpareParts: prevState.selectedSpareParts.filter(selectedId => !ids.includes(selectedId))
      };
    });
  }, []);

  // Toggle selection
  const toggleSparePartSelection = useCallback((id: string) => {
    setState(prevState => ({
      ...prevState,
      selectedSpareParts: prevState.selectedSpareParts.includes(id)
        ? prevState.selectedSpareParts.filter(selectedId => selectedId !== id)
        : [...prevState.selectedSpareParts, id]
    }));
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      selectedSpareParts: []
    }));
  }, []);

  // Get spare part by ID
  const getSparePartById = useCallback((id: string): SparePart | undefined => {
    return state.spareParts.find(part => part.id === id);
  }, [state.spareParts]);

  // Reset to sample data
  const resetToSampleData = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      spareParts: sampleSpareParts,
      filteredSpareParts: sampleSpareParts,
      selectedSpareParts: [],
      filters: { search: '', category: '', status: '' }
    }));
    localStorage.setItem('sparePartsData', JSON.stringify(sampleSpareParts));
  }, []);

  // Export data
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(state.spareParts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spare_parts_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [state.spareParts]);

  return {
    ...state,
    updateFilters,
    addSparePart,
    updateSparePart,
    deleteSparePart,
    deleteMultipleSpareParts,
    toggleSparePartSelection,
    clearSelection,
    getSparePartById,
    resetToSampleData,
    exportData
  };
}
