import { useState, useEffect, useCallback } from 'react';
import type {
  SparePart,
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
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [filteredSpareParts, setFilteredSpareParts] = useState<SparePart[]>([]);
  const [selectedSpareParts, setSelectedSpareParts] = useState<string[]>([]);
  const [filters, setFilters] = useState<SparePartsFilters>({
    search: '',
    category: '',
    status: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    const initializeData = () => {
      try {
        // Load from localStorage or use sample data
        const storedData = localStorage.getItem('sparePartsData');
        let initialSpareParts: SparePart[] = [];

        if (storedData) {
          initialSpareParts = JSON.parse(storedData) as SparePart[];
        } else {
          initialSpareParts = sampleSpareParts;
          localStorage.setItem('sparePartsData', JSON.stringify(initialSpareParts));
        }

        setSpareParts(initialSpareParts);
        setFilteredSpareParts(initialSpareParts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading spare parts data:', error);
        setSpareParts(sampleSpareParts);
        setFilteredSpareParts(sampleSpareParts);
        setIsLoading(false);
        setError('Failed to load data');
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (spareParts.length > 0) {
      const filtered = filterSpareParts(
        spareParts,
        filters.search,
        filters.category,
        filters.status
      );
      setFilteredSpareParts(filtered);
    } else {
      setFilteredSpareParts([]);
    }
  }, [spareParts, filters]);

  const updateFilters = useCallback((newFilters: Partial<SparePartsFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const addSparePart = useCallback((formData: SparePartFormData) => {
    // Validate form data
    const validationErrors = validateSparePartForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    // Check for duplicate ID
    if (isDuplicateSparePartId(spareParts, formData.id)) {
      throw new Error('Part ID already exists');
    }

    const newSparePart = createSparePartFromForm(formData);

    const updatedSpareParts = [...spareParts, newSparePart];
    setSpareParts(updatedSpareParts);

    const filtered = filterSpareParts(
      updatedSpareParts,
      filters.search,
      filters.category,
      filters.status
    );
    setFilteredSpareParts(filtered);

    localStorage.setItem('sparePartsData', JSON.stringify(updatedSpareParts));

    return newSparePart;
  }, [spareParts, filters]);

  const updateSparePart = useCallback((formData: SparePartFormData) => {
    // Validate form data
    const validationErrors = validateSparePartForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      throw new Error('Validation failed');
    }

    // Check for duplicate ID (excluding current item)
    if (isDuplicateSparePartId(spareParts, formData.id, formData.id)) {
      throw new Error('Part ID already exists');
    }

    const updatedSparePart = createSparePartFromForm(formData);

    const updatedSpareParts = spareParts.map(part =>
      part.id === formData.id ? updatedSparePart : part
    );
    setSpareParts(updatedSpareParts);

    const filtered = filterSpareParts(
      updatedSpareParts,
      filters.search,
      filters.category,
      filters.status
    );
    setFilteredSpareParts(filtered);

    localStorage.setItem('sparePartsData', JSON.stringify(updatedSpareParts));

    return updatedSparePart;
  }, [spareParts, filters]);

  const deleteSparePart = useCallback((id: string) => {
    const updatedSpareParts = spareParts.filter(part => part.id !== id);
    setSpareParts(updatedSpareParts);

    const filtered = filterSpareParts(
      updatedSpareParts,
      filters.search,
      filters.category,
      filters.status
    );
    setFilteredSpareParts(filtered);

    setSelectedSpareParts(prev => prev.filter(selectedId => selectedId !== id));
    localStorage.setItem('sparePartsData', JSON.stringify(updatedSpareParts));
  }, [spareParts, filters]);

  const deleteMultipleSpareParts = useCallback((ids: string[]) => {
    const updatedSpareParts = spareParts.filter(part => !ids.includes(part.id));
    setSpareParts(updatedSpareParts);

    const filtered = filterSpareParts(
      updatedSpareParts,
      filters.search,
      filters.category,
      filters.status
    );
    setFilteredSpareParts(filtered);

    setSelectedSpareParts(prev => prev.filter(selectedId => !ids.includes(selectedId)));
    localStorage.setItem('sparePartsData', JSON.stringify(updatedSpareParts));
  }, [spareParts, filters]);

  const toggleSparePartSelection = useCallback((id: string) => {
    setSelectedSpareParts(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSpareParts([]);
  }, []);

  const getSparePartById = useCallback((id: string): SparePart | undefined => {
    return spareParts.find(part => part.id === id);
  }, [spareParts]);

  const resetToSampleData = useCallback(() => {
    setSpareParts(sampleSpareParts);

    const filtered = filterSpareParts(
      sampleSpareParts,
      '',
      '',
      ''
    );
    setFilteredSpareParts(filtered);

    setSelectedSpareParts([]);
    setFilters({ search: '', category: '', status: '' });
    localStorage.setItem('sparePartsData', JSON.stringify(sampleSpareParts));
  }, []);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(spareParts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spare_parts_data_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [spareParts]);

  return {
    spareParts,
    filteredSpareParts,
    selectedSpareParts,
    filters,
    isLoading,
    error,
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
