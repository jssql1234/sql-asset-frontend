import { useState, useEffect, useMemo } from 'react';
import type {
  AssetGroup,
  AssetGroupFormData,
  AssetGroupsFilters,
  AssetGroupsState,
  AssetGroupValidationErrors,
} from '../types/assetGroups';
import {
  filterAssetGroups,
  createAssetGroupFromForm,
  validateAssetGroupForm,
  normalizeAssetGroupCode,
} from '../utils/assetGroupUtils';

interface StoredAssetMain {
  'asset-group'?: unknown;
}

interface StoredAssetRecord {
  main?: StoredAssetMain;
}

interface StoredAssetPayload {
  assets?: StoredAssetRecord[];
}

const isStoredAssetRecord = (value: unknown): value is StoredAssetRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as { main?: unknown };
  if (record.main === undefined) {
    return true;
  }

  return typeof record.main === 'object' && record.main !== null;
};

const extractAssetGroupId = (asset: StoredAssetRecord): string | null => {
  const potentialGroupId = asset.main?.['asset-group'];
  return typeof potentialGroupId === 'string' && potentialGroupId.trim().length > 0
    ? potentialGroupId
    : null;
};

const STORAGE_KEY = 'assetGroupsData';

const sampleAssetGroups: AssetGroup[] = [
  {
    id: 'COMPUTER',
    name: 'Computer & IT Equipment',
    description: 'Computers, laptops, servers, printers, and IT accessories',
    status: 'Active',
    createdAt: '2023-01-15'
  },
  {
    id: 'FURNITURE',
    name: 'Office Furniture', 
    description: 'Desks, chairs, cabinets, and office fixtures',
    status: 'Active',
    createdAt: '2023-01-20'
  },
  {
    id: 'VEHICLE',
    name: 'Motor Vehicle',
    description: 'Cars, trucks, motorcycles, and other vehicles',
    status: 'Active',
    createdAt: '2023-02-10'
  },
  {
    id: 'MACHINERY',
    name: 'Heavy Machinery',
    description: 'Industrial equipment and heavy machinery',
    status: 'Active',
    createdAt: '2023-02-15'
  },
  {
    id: 'BUILDING',
    name: 'Building & Structure',
    description: 'Buildings, structures, and construction assets',
    status: 'Active',
    createdAt: '2023-03-05'
  },
  {
    id: 'ELECTRICAL',
    name: 'Electrical Equipment',
    description: 'Electrical systems and equipment',
    status: 'Active',
    createdAt: '2023-03-10'
  },
  {
    id: 'SOFTWARE',
    name: 'Software & License',
    description: 'Software licenses and digital assets',
    status: 'Active',
    createdAt: '2023-03-15'
  },
  {
    id: 'TOOLS',
    name: 'Tools & Equipment',
    description: 'Hand tools and small equipment',
    status: 'Active',
    createdAt: '2023-04-01'
  },
  {
    id: 'SECURITY',
    name: 'Security Equipment',
    description: 'Security systems and surveillance equipment',
    status: 'Active',
    createdAt: '2023-04-05'
  },
  {
    id: 'COMMUNICATION',
    name: 'Communication Equipment',
    description: 'Phones, radios, and communication devices',
    status: 'Active',
    createdAt: '2023-04-10'
  }
];

export function useAssetGroups() {
  const [state, setState] = useState<AssetGroupsState>({
    assetGroups: [],
    filteredAssetGroups: [],
    selectedAssetGroupIds: [],
    isLoading: false,
    filters: {
      searchValue: ''
    }
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAssetGroup, setEditingAssetGroup] = useState<AssetGroup | null>(null);
  const [formErrors, setFormErrors] = useState<AssetGroupValidationErrors>({});

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      setState(prev => ({
        ...prev,
        assetGroups: sampleAssetGroups,
        filteredAssetGroups: sampleAssetGroups,
      }));
      return;
    }

    const storedData = window.localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData) as { assetGroups?: AssetGroup[] } | null;
        const storedAssetGroups = parsed?.assetGroups;
        if (Array.isArray(storedAssetGroups)) {
          setState(prev => ({
            ...prev,
            assetGroups: storedAssetGroups,
            filteredAssetGroups: storedAssetGroups,
          }));
          return;
        }
      } catch (error) {
        console.error('Error parsing asset groups data:', error);
      }
    }

    setState(prev => ({
      ...prev,
      assetGroups: sampleAssetGroups,
      filteredAssetGroups: sampleAssetGroups,
    }));
    saveToLocalStorage(sampleAssetGroups);
  }, []);

  // Save to localStorage
  const saveToLocalStorage = (assetGroups: AssetGroup[]) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ assetGroups }));
    } catch (error) {
      console.error('Error saving asset groups:', error);
    }
  };

  // Filter asset groups based on filters
  useEffect(() => {
    const filtered = filterAssetGroups(state.assetGroups, state.filters);
    setState(prev => ({
      ...prev,
      filteredAssetGroups: filtered
    }));
  }, [state.assetGroups, state.filters]);

  // Asset count calculation
  const assetGroupAssetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Read assets from localStorage to get current count
    if (typeof window === 'undefined') {
      return state.assetGroups.reduce<Record<string, number>>((acc, assetGroup) => {
        acc[assetGroup.id] = 0;
        return acc;
      }, {});
    }

    try {
      const assetsData = window.localStorage.getItem('assetsData');
      if (assetsData) {
        const parsed = JSON.parse(assetsData) as unknown;
        const assets =
          typeof parsed === 'object' && parsed !== null
            ? (parsed as StoredAssetPayload).assets
            : undefined;

        if (Array.isArray(assets) && assets.every(isStoredAssetRecord)) {
          assets.forEach(asset => {
            const groupId = extractAssetGroupId(asset);
            if (groupId) {
              counts[groupId] = (counts[groupId] ?? 0) + 1;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error reading assets data:', error);
    }
    
    // Ensure all current asset groups have entries (possibly zero)
    state.assetGroups.forEach(assetGroup => {
      if (!(assetGroup.id in counts)) {
        counts[assetGroup.id] = 0;
      }
    });
    
    return counts;
  }, [state.assetGroups]);

  // CRUD Operations
  const createAssetGroup = (formData: AssetGroupFormData) => {
    const normalizedId = normalizeAssetGroupCode(formData.id);
    const normalizedFormData: AssetGroupFormData = {
      ...formData,
      id: normalizedId,
    };

    const errors = validateAssetGroupForm(normalizedFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }

    // Check for duplicate code
    if (state.assetGroups.some(group => group.id === normalizedId)) {
      setFormErrors({ id: 'Asset group code already exists' });
      return false;
    }

    const newAssetGroup = createAssetGroupFromForm(normalizedFormData);
    const updatedAssetGroups = [...state.assetGroups, newAssetGroup];
    
    setState(prev => ({
      ...prev,
      assetGroups: updatedAssetGroups
    }));
    
    saveToLocalStorage(updatedAssetGroups);
    setFormErrors({});
    return true;
  };

  const updateAssetGroup = (formData: AssetGroupFormData) => {
    const normalizedId = normalizeAssetGroupCode(formData.id);
    const normalizedFormData: AssetGroupFormData = {
      ...formData,
      id: normalizedId,
    };

    const errors = validateAssetGroupForm(normalizedFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return false;
    }

    const currentId = editingAssetGroup?.id ?? normalizedId;
    const existingIndex = state.assetGroups.findIndex(group => group.id === currentId);
    if (existingIndex === -1) {
      setFormErrors({ id: 'Asset group not found' });
      return false;
    }

    // Check for duplicate code (excluding current)
    if (state.assetGroups.some(group => group.id === normalizedId && group.id !== editingAssetGroup?.id)) {
      setFormErrors({ id: 'Asset group code already exists' });
      return false;
    }

    const updatedAssetGroup: AssetGroup = {
      ...createAssetGroupFromForm(normalizedFormData),
      createdAt: state.assetGroups[existingIndex].createdAt
    };

    const updatedAssetGroups = state.assetGroups.map(group => 
      group.id === currentId ? updatedAssetGroup : group
    );

    setState(prev => ({
      ...prev,
      assetGroups: updatedAssetGroups
    }));
    
    saveToLocalStorage(updatedAssetGroups);
    setFormErrors({});
    return true;
  };

  const deleteAssetGroup = (id: string) => {
    const assetCount = assetGroupAssetCounts[id] || 0;
    
    if (assetCount > 0) {
      throw new Error(`Cannot delete asset group with ${String(assetCount)} asset(s). Please reassign or delete the assets first.`);
    }

    const updatedAssetGroups = state.assetGroups.filter(group => group.id !== id);
    const updatedSelectedIds = state.selectedAssetGroupIds.filter(selectedId => selectedId !== id);
    
    setState(prev => ({
      ...prev,
      assetGroups: updatedAssetGroups,
      selectedAssetGroupIds: updatedSelectedIds
    }));
    
    saveToLocalStorage(updatedAssetGroups);
  };

  const deleteSelectedAssetGroups = () => {
    const deletableIds = state.selectedAssetGroupIds.filter(id => 
      (assetGroupAssetCounts[id] || 0) === 0
    );

    if (deletableIds.length === 0) {
      throw new Error('No selected asset groups can be deleted. Some have associated assets.');
    }

    const nonDeletibleCount = state.selectedAssetGroupIds.length - deletableIds.length;
    if (nonDeletibleCount > 0) {
      throw new Error(`Only ${String(deletableIds.length)} of ${String(state.selectedAssetGroupIds.length)} selected groups can be deleted. ${String(nonDeletibleCount)} have associated assets.`);
    }

    const updatedAssetGroups = state.assetGroups.filter(group =>
      !deletableIds.includes(group.id)
    );

    setState(prev => ({
      ...prev,
      assetGroups: updatedAssetGroups,
      selectedAssetGroupIds: []
    }));
    
    saveToLocalStorage(updatedAssetGroups);
  };

  // Selection Management
  const toggleAssetGroupSelection = (id: string) => {
    setState(prev => ({
      ...prev,
      selectedAssetGroupIds: prev.selectedAssetGroupIds.includes(id)
        ? prev.selectedAssetGroupIds.filter(selectedId => selectedId !== id)
        : [...prev.selectedAssetGroupIds, id]
    }));
  };

  const toggleAllAssetGroupSelection = () => {
    setState(prev => ({
      ...prev,
      selectedAssetGroupIds: 
        prev.selectedAssetGroupIds.length === prev.filteredAssetGroups.length
          ? []
          : prev.filteredAssetGroups.map(group => group.id)
    }));
  };

  // Search and Filter
  const updateFilters = (filters: Partial<AssetGroupsFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: { searchValue: '' }
    }));
  };

  // Modal Management
  const openAddModal = () => {
    setEditingAssetGroup(null);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const openEditModal = (assetGroup: AssetGroup) => {
    setEditingAssetGroup(assetGroup);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAssetGroup(null);
    setFormErrors({});
  };

  const clearFormFieldError = (field: keyof AssetGroupValidationErrors) => {
    setFormErrors(prevErrors => {
      if (!prevErrors[field]) {
        return prevErrors;
      }
      const { [field]: removedValue, ...rest } = prevErrors;
      if (removedValue === undefined) {
        return prevErrors;
      }
      return rest;
    });
  };

  // Export Functionality
  const exportData = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const csvContent = [
      ['Asset Group Code', 'Asset Group Name', 'Description', 'Status', 'Created Date'],
      ...state.assetGroups.map(group => [
        group.id,
        group.name,
        group.description,
        group.status,
        group.createdAt
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `asset-groups-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Reset to Sample Data
  const resetToSampleData = () => {
    setState(prev => ({
      ...prev,
      assetGroups: sampleAssetGroups,
      filteredAssetGroups: sampleAssetGroups,
      selectedAssetGroupIds: []
    }));
    saveToLocalStorage(sampleAssetGroups);
  };

  return {
    // State
    ...state,
    isFormModalOpen,
    editingAssetGroup,
    formErrors,
    assetGroupAssetCounts,
    
    // Actions
    createAssetGroup,
    updateAssetGroup,
    deleteAssetGroup,
    deleteSelectedAssetGroups,
    toggleAssetGroupSelection,
    toggleAllAssetGroupSelection,
    updateFilters,
    clearFilters,
    openAddModal,
    openEditModal,
    closeFormModal,
    exportData,
    resetToSampleData,
    clearFormFieldError,
    
    // Computed
    hasSelection: state.selectedAssetGroupIds.length > 0,
    hasSingleSelection: state.selectedAssetGroupIds.length === 1,
    canDeleteSelected: state.selectedAssetGroupIds.some(id => (assetGroupAssetCounts[id] || 0) === 0)
  };
}
