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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const exportData = useCallback((format: string, visibleIds: string[]) => {
    if (typeof window === 'undefined') {
      return;
    }

    const exportGroups = selectedAssetGroupIds.length > 0 
      ? filteredAssetGroups.filter(group => selectedAssetGroupIds.includes(group.id))
      : filteredAssetGroups;

    if (exportGroups.length === 0) {
      return;
    }

    const fieldConfig = {
      assetGroupCode: {
        header: 'Asset Group Code',
        key: 'code',
        getValue: (group: AssetGroup) => group.id,
      },
      name: {
        header: 'Asset Group Name',
        key: 'name',
        getValue: (group: AssetGroup) => group.name,
      },
      description: {
        header: 'Description',
        key: 'description',
        getValue: (group: AssetGroup) => group.description || 'No description provided',
      },
      assetCount: {
        header: 'Asset Count',
        key: 'assetCount',
        getValue: (group: AssetGroup) => String(assetGroupAssetCounts[group.id] ?? 0),
      },
      createdAt: {
        header: 'Created Date',
        key: 'createdDate',
        getValue: (group: AssetGroup) => formatAssetGroupDate(group.createdAt) || '-',
      },
    };

    const includedKeys = new Set(visibleIds);
    if (includedKeys.has('name')) {
      includedKeys.add('description');
    }

    const headers = Array.from(includedKeys).map(key => fieldConfig[key as keyof typeof fieldConfig].header);

    const exportBody = exportGroups.map(group => 
      Array.from(includedKeys).map(key => fieldConfig[key as keyof typeof fieldConfig].getValue(group))
    );

    const dateStr = new Date().toISOString().split('T')[0];
    let filename = `asset-groups-${format.toUpperCase()}-${dateStr}`;
    let blob: Blob;

    const escapeXml = (unsafe: string): string => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    switch (format.toLowerCase()) {
      case 'csv': {
        const csvRows = [headers, ...exportBody];
        const csvContent = csvRows.map(row => 
          row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        filename += '.csv';
        break;
      }

      case 'json': {
        const jsonData = exportGroups.map(group => {
          const data: Record<string, string | number> = {};
          includedKeys.forEach(key => {
            const configKey = key as keyof typeof fieldConfig;
            data[fieldConfig[configKey].key] = fieldConfig[configKey].getValue(group);
          });
          return data;
        });
        blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        filename += '.json';
        break;
      }

      case 'txt': {
        const txtContent = [headers.join('\t'), ...exportBody.map(row => row.map(String).join('\t'))].join('\n');
        blob = new Blob([txtContent], { type: 'text/plain' });
        filename += '.txt';
        break;
      }

      case 'html': {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Asset Groups Export</title>
  <style>table { border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } th { background-color: #f2f2f2; }</style>
</head>
<body>
  <h1>Asset Groups</h1>
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${exportBody.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>
</body>
</html>`;
        blob = new Blob([htmlContent], { type: 'text/html' });
        filename += '.html';
        break;
      }

      case 'xml': {
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<assetGroups>\n';
        exportGroups.forEach(group => {
          xmlContent += '  <group>\n';
          includedKeys.forEach(key => {
            const configKey = key as keyof typeof fieldConfig;
            const value = fieldConfig[configKey].getValue(group);
            const escapedValue = escapeXml(value);
            xmlContent += `    <${fieldConfig[configKey].key}>${escapedValue}</${fieldConfig[configKey].key}>\n`;
          });
          xmlContent += '  </group>\n';
        });
        xmlContent += '</assetGroups>';
        blob = new Blob([xmlContent], { type: 'application/xml' });
        filename += '.xml';
        break;
      }

      case 'xlsx': {
        const wsData = exportGroups.map(group => {
          const row: Record<string, string | number> = {};
          includedKeys.forEach(key => {
            const configKey = key as keyof typeof fieldConfig;
            row[fieldConfig[configKey].header] = fieldConfig[configKey].getValue(group);
          });
          return row;
        });
        const ws = XLSX.utils.json_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Asset Groups');
        const arrayBuffer = XLSX.write(wb, { type: 'array' }) as ArrayBuffer;
        blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        filename += '.xlsx';
        break;
      }

      case 'pdf': {
        const doc = new jsPDF('l', 'mm', 'a4');
        (autoTable as unknown as (doc: jsPDF, options: unknown) => void)(doc, {
          head: [headers],
          body: exportBody.map(row => row.map(cell => cell)),
          startY: 20,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
          headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
          margin: { top: 20 }
        });
        blob = doc.output('blob');
        filename += '.pdf';
        break;
      }

      default:
        console.warn('Unsupported export format:', format);
        return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredAssetGroups, selectedAssetGroupIds, assetGroupAssetCounts]);

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
