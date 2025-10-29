import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AssetGroup,
  AssetGroupFormData,
  AssetGroupsFilters,
  AssetGroupValidationErrors,
} from '../types/assetGroups';
import {
  createAssetGroupFromForm,
  filterAssetGroups,
  generateAssetGroupId,
  normalizeAssetGroupCode,
  validateAssetGroupForm,
  formatAssetGroupDate,
} from '../utils/assetGroupUtils';
import { useToast } from '@/components/ui/components/Toast';
import type { ExportColumn } from '@/utils/exportUtils';
import { exportTableData } from '@/utils/exportUtils';

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
    createdAt: '2023-01-15',
  },
  {
    id: 'FURNITURE',
    name: 'Office Furniture',
    description: 'Desks, chairs, cabinets, and office fixtures',
    createdAt: '2023-01-20',
  },
  {
    id: 'VEHICLE',
    name: 'Motor Vehicle',
    description: 'Cars, trucks, motorcycles, and other vehicles',
    createdAt: '2023-02-10',
  },
  {
    id: 'MACHINERY',
    name: 'Heavy Machinery',
    description: 'Industrial equipment and heavy machinery',
    createdAt: '2023-02-15',
  },
  {
    id: 'BUILDING',
    name: 'Building & Structure',
    description: 'Buildings, structures, and construction assets',
    createdAt: '2023-03-05',
  },
  {
    id: 'ELECTRICAL',
    name: 'Electrical Equipment',
    description: 'Electrical systems and equipment',
    createdAt: '2023-03-10',
  },
  {
    id: 'SOFTWARE',
    name: 'Software & License',
    description: 'Software licenses and digital assets',
    createdAt: '2023-03-15',
  },
  {
    id: 'TOOLS',
    name: 'Tools & Equipment',
    description: 'Hand tools and small equipment',
    createdAt: '2023-04-01',
  },
  {
    id: 'SECURITY',
    name: 'Security Equipment',
    description: 'Security systems and surveillance equipment',
    createdAt: '2023-04-05',
  },
  {
    id: 'COMMUNICATION',
    name: 'Communication Equipment',
    description: 'Phones, radios, and communication devices',
    createdAt: '2023-04-10',
  },
];

export function useAssetGroups() {
  const [assetGroups, setAssetGroups] = useState<AssetGroup[]>([]);
  const [filteredAssetGroups, setFilteredAssetGroups] = useState<AssetGroup[]>([]);
  const [selectedAssetGroupIds, setSelectedAssetGroupIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<AssetGroupsFilters>({ searchValue: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssetGroup, setEditingAssetGroup] = useState<AssetGroup | null>(null);
  const [formErrors, setFormErrors] = useState<AssetGroupValidationErrors>({});
  const { addToast } = useToast();

  const clearFormErrors = useCallback(() => {
    setFormErrors({});
  }, []);

  useEffect(() => {
    const initialize = () => {
      try {
        let initialAssetGroups = sampleAssetGroups;

        if (typeof window !== 'undefined') {
          const stored = window.localStorage.getItem(STORAGE_KEY);

          if (stored) {
            const parsed = JSON.parse(stored) as { assetGroups?: AssetGroup[] } | AssetGroup[] | null;

            if (Array.isArray(parsed)) {
              initialAssetGroups = parsed;
            } else if (parsed && Array.isArray(parsed.assetGroups)) {
              initialAssetGroups = parsed.assetGroups;
            }
          } else {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ assetGroups: sampleAssetGroups }));
          }
        }

        setAssetGroups(initialAssetGroups);
        setFilteredAssetGroups(filterAssetGroups(initialAssetGroups, { searchValue: '' }));
        setIsLoading(false);
      } catch (initializationError) {
        console.error('Error initializing asset groups data:', initializationError);
        setAssetGroups(sampleAssetGroups);
        setFilteredAssetGroups(sampleAssetGroups);
        setIsLoading(false);
        setError('Failed to load asset groups data');
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const filtered = filterAssetGroups(assetGroups, filters);
    setFilteredAssetGroups(filtered);
  }, [assetGroups, filters]);

  const assetGroupAssetCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    if (typeof window === 'undefined') {
      return assetGroups.reduce<Record<string, number>>((acc, assetGroup) => {
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

    assetGroups.forEach(assetGroup => {
      if (!(assetGroup.id in counts)) {
        counts[assetGroup.id] = 0;
      }
    });

    return counts;
  }, [assetGroups]);

  const persistAssetGroups = useCallback((nextAssetGroups: AssetGroup[]) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ assetGroups: nextAssetGroups }));
    } catch (storageError) {
      console.error('Error saving asset groups:', storageError);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<AssetGroupsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const isDuplicateId = useCallback((id: string, ignoreId?: string) => {
    const normalized = normalizeAssetGroupCode(id);
    return assetGroups.some(assetGroup => assetGroup.id === normalized && assetGroup.id !== ignoreId);
  }, [assetGroups]);

  const addAssetGroup = useCallback((formData: AssetGroupFormData) => {
    const validationErrors = validateAssetGroupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      throw new Error('Validation failed');
    }

    if (isDuplicateId(formData.id)) {
      setFormErrors({ id: 'Asset group code already exists' });
      throw new Error('Asset group code already exists');
    }

    const newAssetGroup = createAssetGroupFromForm(formData);

    setAssetGroups(prev => {
      const next = [...prev, newAssetGroup];
      persistAssetGroups(next);
      return next;
    });

    setFormErrors({});
    return newAssetGroup;
  }, [isDuplicateId, persistAssetGroups]);

  const updateAssetGroup = useCallback((formData: AssetGroupFormData, originalId?: string) => {
    const validationErrors = validateAssetGroupForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      throw new Error('Validation failed');
    }

    const normalizedId = normalizeAssetGroupCode(formData.id);
    const referenceId = originalId ?? normalizedId;

    if (isDuplicateId(normalizedId, referenceId)) {
      setFormErrors({ id: 'Asset group code already exists' });
      throw new Error('Asset group code already exists');
    }

    setAssetGroups(prev => {
      const next = prev.map(assetGroup => {
        if (assetGroup.id !== referenceId) {
          return assetGroup;
        }

        const updatedAssetGroup = createAssetGroupFromForm(formData);
        return {
          ...updatedAssetGroup,
          createdAt: assetGroup.createdAt,
        };
      });

      persistAssetGroups(next);
      return next;
    });

    setFormErrors({});
  }, [isDuplicateId, persistAssetGroups]);

  const deleteMultipleAssetGroups = useCallback((ids: string[]) => {
    const blocked = ids.filter(id => (assetGroupAssetCounts[id] ?? 0) > 0);
    if (blocked.length > 0) {
      const blockedCount = blocked.length;
      throw new Error(`Unable to delete ${String(blockedCount)} selected group(s) because asset(s) are still assigned.`);
    }

    setAssetGroups(prev => {
      const next = prev.filter(assetGroup => !ids.includes(assetGroup.id));
      persistAssetGroups(next);
      return next;
    });

    setSelectedAssetGroupIds(prev => prev.filter(id => !ids.includes(id)));
  }, [assetGroupAssetCounts, persistAssetGroups]);

  const toggleAssetGroupSelection = useCallback((id: string) => {
    setSelectedAssetGroupIds(prev => (
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    ));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAssetGroupIds([]);
  }, []);

  const getAssetGroupById = useCallback((id: string) => {
    return assetGroups.find(assetGroup => assetGroup.id === id) ?? null;
  }, [assetGroups]);

  const resetToSampleData = useCallback(() => {
    setAssetGroups(sampleAssetGroups);
    setFilteredAssetGroups(sampleAssetGroups);
    setSelectedAssetGroupIds([]);
    setFilters({ searchValue: '' });
    persistAssetGroups(sampleAssetGroups);
  }, [persistAssetGroups]);

  const isAssetCountContext = (ctx: unknown): ctx is { assetCounts?: Record<string, number> } => {
    return ctx !== null && typeof ctx === 'object' && 'assetCounts' in ctx;
  };

  const exportColumns: ExportColumn<AssetGroup>[] = useMemo(() => ([
    {
      id: 'assetGroupCode',
      header: 'Asset Group Code',
      key: 'code',
      getValue: (group: AssetGroup) => group.id,
    },
    {
      id: 'name',
      header: 'Asset Group Name',
      key: 'name',
      getValue: (group: AssetGroup) => group.name,
    },
    {
      id: 'description',
      header: 'Description',
      key: 'description',
      getValue: (group: AssetGroup) => group.description || 'No description provided',
    },
    {
      id: 'assetCount',
      header: 'Asset Count',
      key: 'assetCount',
      getValue: (group: AssetGroup, ctx?: unknown) => {
        if (isAssetCountContext(ctx)) {
          return String(ctx.assetCounts?.[group.id] ?? 0);
        }
        return '0';
      },
    },
    {
      id: 'createdAt',
      header: 'Created Date',
      key: 'createdDate',
      getValue: (group: AssetGroup) => formatAssetGroupDate(group.createdAt) || '-',
    },
  ]), []);

  const exportData = useCallback((format: string, visibleIds: string[]) => {
    const exportGroups = selectedAssetGroupIds.length > 0 
      ? filteredAssetGroups.filter(group => selectedAssetGroupIds.includes(group.id))
      : filteredAssetGroups;

    if (exportGroups.length === 0) {
      return;
    }

    let includedKeys = [...visibleIds];
    if (includedKeys.includes('name') && !includedKeys.includes('description')) {
      includedKeys = [...includedKeys, 'description'];
    }

    const extraContext = { assetCounts: assetGroupAssetCounts };

    exportTableData(
      exportGroups,
      exportColumns,
      includedKeys,
      format,
      'asset-groups',
      extraContext,
      { 
        rootTag: 'assetGroups', 
        itemTag: 'group', 
        htmlTitle: 'Asset Groups Export' 
      }
    );
  }, [filteredAssetGroups, selectedAssetGroupIds, assetGroupAssetCounts, exportColumns]);

  const getNewAssetGroupId = useCallback(() => generateAssetGroupId(assetGroups), [assetGroups]);

  const openModal = useCallback((assetGroup: AssetGroup | null) => {
    setEditingAssetGroup(assetGroup);
    clearFormErrors();
    setIsModalOpen(true);
  }, [clearFormErrors]);

  const handleAddAssetGroup = useCallback(() => {
    openModal(null);
  }, [openModal]);

  const handleEditAssetGroup = useCallback((assetGroup: AssetGroup) => {
    openModal(assetGroup);
  }, [openModal]);

  const handleSaveAssetGroup = (formData: AssetGroupFormData) => {
    try {
      if (editingAssetGroup) {
        updateAssetGroup(formData, editingAssetGroup.id);
        addToast({
          variant: 'success',
          title: 'Asset Group Updated',
          description: `Asset group "${formData.name}" has been updated successfully.`,
          duration: 5000,
        });
      } else {
        addAssetGroup(formData);
        addToast({
          variant: 'success',
          title: 'Asset Group Created',
          description: `Asset group "${formData.name}" has been created successfully.`,
          duration: 5000,
        });
      }
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Unable to save asset group',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while saving the asset group.',
      });
      throw error;
    }
  };

  const handleDeleteMultipleAssetGroups = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    if (!confirm(`Are you sure you want to delete ${String(ids.length)} selected asset group(s)?`)) {
      return;
    }

    try {
      deleteMultipleAssetGroups(ids);
      addToast({
        variant: 'success',
        title: 'Asset groups deleted',
        description: `${String(ids.length)} asset group(s) deleted successfully.`,
      });
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Failed to delete asset groups',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while deleting the selected asset groups.',
      });
    }
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    clearFormErrors();
    setEditingAssetGroup(null);
  }, [clearFormErrors]);

  return {
    assetGroups,
    filteredAssetGroups,
    selectedAssetGroupIds,
    filters,
    isLoading,
    error,
    isModalOpen,
    editingAssetGroup,
    formErrors,
    updateFilters,
    toggleAssetGroupSelection,
    handleAddAssetGroup,
    handleEditAssetGroup,
    handleDeleteMultipleAssetGroups,
    handleSaveAssetGroup,
    assetGroupAssetCounts,
    clearSelection,
    getAssetGroupById,
    resetToSampleData,
    exportData,
    getNewAssetGroupId,
    clearFormErrors,
    closeModal,
  };
}
