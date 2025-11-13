import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  SparePart,
  SparePartsFilters,
  SparePartFormData,
  SparePartValidationErrors,
} from '../types/spareParts';
import {
  createSparePartFromForm,
  filterSpareParts,
  generateSparePartId,
  isDuplicateSparePartId,
  validateSparePartForm,
  calculateStockStatus,
  formatCurrency,
  formatDate,
} from '../utils/sparePartsUtils';
import { useToast } from '@/components/ui/components/Toast';
import type { ExportColumn } from '@/utils/exportUtils';
import { exportTableData } from '@/utils/exportUtils';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [formErrors, setFormErrors] = useState<SparePartValidationErrors>({});
  const { addToast } = useToast();

  const clearFormErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = () => {
      try {
        // Load from localStorage or use sample data
        const storedData = typeof window !== 'undefined' ? window.localStorage.getItem('sparePartsData') : null;
        let initialSpareParts: SparePart[] = [];

        if (storedData) {
          initialSpareParts = JSON.parse(storedData) as SparePart[];
        } else {
          initialSpareParts = sampleSpareParts;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('sparePartsData', JSON.stringify(initialSpareParts));
          }
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
      setFilteredSpareParts(filterSpareParts(spareParts, filters.search, filters.category, filters.status));
    } else {
      setFilteredSpareParts([]);
    }
  }, [spareParts, filters]);

  const updateFilters = useCallback((newFilters: Partial<SparePartsFilters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  const persistSpareParts = useCallback((nextSpareParts: SparePart[]) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem('sparePartsData', JSON.stringify(nextSpareParts));
    } catch (storageError) {
      console.error('Error saving spare parts data:', storageError);
    }
  }, []);

  const addSparePart = useCallback((formData: SparePartFormData) => {
    // Validate form data
    const validationErrors = validateSparePartForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      throw new Error('Validation failed');
    }

    // Check for duplicate ID
    if (isDuplicateSparePartId(spareParts, formData.id)) {
      setFormErrors({ id: 'Part ID already exists' });
      throw new Error('Part ID already exists');
    }

    const newSparePart = createSparePartFromForm(formData);

    const updatedSpareParts = [...spareParts, newSparePart];
    setSpareParts(updatedSpareParts);
    persistSpareParts(updatedSpareParts);
    setFormErrors({});
    return newSparePart;
  }, [persistSpareParts, spareParts]);

  const updateSparePart = useCallback((formData: SparePartFormData) => {
    // Validate form data
    const validationErrors = validateSparePartForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      throw new Error('Validation failed');
    }

    // Check for duplicate ID (excluding current item)
    if (isDuplicateSparePartId(spareParts, formData.id, editingPart?.id ?? formData.id)) {
      setFormErrors({ id: 'Part ID already exists' });
      throw new Error('Part ID already exists');
    }

    const updatedSparePart = createSparePartFromForm(formData);

    const updatedSpareParts = spareParts.map(part =>
      part.id === (editingPart?.id ?? formData.id) ? updatedSparePart : part
    );
    setSpareParts(updatedSpareParts);
    persistSpareParts(updatedSpareParts);
    setFormErrors({});

    return updatedSparePart;
  }, [editingPart?.id, persistSpareParts, spareParts]);

  const deleteMultipleSpareParts = useCallback((ids: string[]) => {
    const updatedSpareParts = spareParts.filter(part => !ids.includes(part.id));
    setSpareParts(updatedSpareParts);
    setSelectedSpareParts(prev => prev.filter(selectedId => !ids.includes(selectedId)));
    persistSpareParts(updatedSpareParts);
  }, [persistSpareParts, spareParts]);

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

  const resetToSampleData = useCallback(() => {
    setSpareParts(sampleSpareParts);
    setFilteredSpareParts(sampleSpareParts);
    setSelectedSpareParts([]);
    setFilters({ search: '', category: '', status: '' });
    clearFormErrors();
    persistSpareParts(sampleSpareParts);
  }, [clearFormErrors, persistSpareParts]);

  const exportColumns: ExportColumn<SparePart>[] = useMemo(() => ([
    {
      id: 'partId',
      header: 'Part ID',
      key: 'id',
      getValue: (part: SparePart) => part.id,
    },
    {
      id: 'name',
      header: 'Name',
      key: 'name',
      getValue: (part: SparePart) => part.name,
    },
    {
      id: 'description',
      header: 'Description',
      key: 'description',
      getValue: (part: SparePart) => part.description,
    },
    {
      id: 'category',
      header: 'Category',
      key: 'category',
      getValue: (part: SparePart) => part.category,
    },
    {
      id: 'stockQty',
      header: 'Stock Qty',
      key: 'stockQty',
      getValue: (part: SparePart) => part.stockQty.toString(),
    },
    {
      id: 'unitPrice',
      header: 'Unit Price',
      key: 'unitPrice',
      getValue: (part: SparePart) => formatCurrency(part.unitPrice),
    },
    {
      id: 'supplier',
      header: 'Supplier',
      key: 'supplier',
      getValue: (part: SparePart) => part.supplier,
    },
    {
      id: 'location',
      header: 'Location',
      key: 'location',
      getValue: (part: SparePart) => part.location,
    },
    {
      id: 'lastUpdated',
      header: 'Last Updated',
      key: 'lastUpdated',
      getValue: (part: SparePart) => formatDate(part.lastUpdated),
    },
    {
      id: 'status',
      header: 'Status',
      key: 'status',
      getValue: (part: SparePart) => calculateStockStatus(part.stockQty, part.lowStockThreshold, part.operationalStatus),
    },
  ]), []);

  const exportData = useCallback((format: string, visibleIds: string[]) => {
    const exportParts = selectedSpareParts.length > 0 
      ? filteredSpareParts.filter(part => selectedSpareParts.includes(part.id))
      : filteredSpareParts;

    if (exportParts.length === 0) {
      return;
    }

    let includedKeys = [...visibleIds];
    if (includedKeys.includes('name') && !includedKeys.includes('description')) {
      includedKeys = [...includedKeys, 'description'];
    }

    exportTableData(
      exportParts,
      exportColumns,
      includedKeys,
      format,
      'spare-parts',
      undefined,
      { 
        rootTag: 'spareParts', 
        itemTag: 'part', 
        htmlTitle: 'Spare Parts Export' 
      }
    );
  }, [filteredSpareParts, selectedSpareParts, exportColumns]);

  const getNewSparePartId = useCallback(() => generateSparePartId(spareParts), [spareParts]);

  const openModal = useCallback((part: SparePart | null) => {
    setEditingPart(part);
    clearFormErrors();
    setIsModalOpen(true);
  }, [clearFormErrors]);

  const handleAddSparePart = useCallback(() => {
    openModal(null);
  }, [openModal]);

  const handleEditSparePart = useCallback((part: SparePart) => {
    openModal(part);
  }, [openModal]);

  const handleSaveSparePart = useCallback((formData: SparePartFormData) => {
    try {
      if (editingPart) {
        updateSparePart(formData);
        addToast({
          title: 'Success',
          description: `Spare part "${formData.name}" has been updated successfully.`,
          variant: 'success',
          duration: 5000,
        });
      } else {
        addSparePart(formData);
        addToast({
          title: 'Success',
          description: `Spare part "${formData.name}" has been created successfully.`,
          variant: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while saving the spare part.',
        variant: 'error',
      });
      throw error;
    }
  }, [addSparePart, addToast, editingPart, updateSparePart]);

  const handleDeleteSparePart = (id: string) => {
    if (!id) return;

    try {
      deleteMultipleSpareParts([id]); 
      addToast({
        title: 'Success',
        description: 'Spare part deleted successfully!',
        variant: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete spare part.',
        variant: 'error',
      });
    }
  };

  const handleDeleteMultipleSpareParts = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    if (!confirm(`Are you sure you want to delete ${String(ids.length)} selected spare part(s)?`)) {
      return;
    }

    try {
      deleteMultipleSpareParts(ids);
      addToast({
        title: 'Success',
        description: `${String(ids.length)} spare part(s) deleted successfully!`,
        variant: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while deleting the spare parts.',
        variant: 'error',
      });
    }
  }, [addToast, deleteMultipleSpareParts]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    clearFormErrors();
    setEditingPart(null);
  }, [clearFormErrors]);

  return {
    spareParts,
    filteredSpareParts,
    selectedSpareParts,
    filters,
    isLoading,
    error,
    isModalOpen,
    editingPart,
    formErrors,
    updateFilters,
    toggleSparePartSelection,
    clearSelection,
    handleAddSparePart,
    handleEditSparePart,
    handleDeleteSparePart,
    handleDeleteMultipleSpareParts,
    handleSaveSparePart,
    clearFormErrors,
    closeModal,
    resetToSampleData,
    exportData,
    getNewSparePartId,
  };
}
