import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import SelectDropdown from '@/components/SelectDropdown';
import type { SelectDropdownOption } from '@/components/SelectDropdown';
import type { ColumnDef } from '@tanstack/react-table';
import AssetGroupsSearchAndFilter from '../components/AssetGroupsSearchAndFilter';
import { AssetGroupsTable } from '../components/AssetGroupsTable';
import AssetGroupFormModal from '../components/AssetGroupFormModal';
import { useAssetGroups } from '../hooks/useAssetGroups';
import { ExportFile } from '@/assets/icons';
import type { AssetGroup } from '../types/assetGroups';

const MaintainAssetGroupPage: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'>('pdf');
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);

  const exportOptions: SelectDropdownOption[] = [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'html', label: 'HTML' },
    { value: 'txt', label: 'TXT' }, 
  ];

  const handleVisibleColumnsChange = useCallback((visible: ColumnDef<AssetGroup>[]) => {
    setVisibleColumnIds(visible.map(c => c.id ?? ''));
  }, []);

  useEffect(() => {
    setVisibleColumnIds(['assetGroupCode', 'name', 'assetCount', 'createdAt']);
  }, []);

  const {
    assetGroups,
    filteredAssetGroups,
    selectedAssetGroupIds,
    filters,
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
    clearFormErrors,
    closeModal,
    exportData,
  } = useAssetGroups();

  const handleExport = () => {
    exportData(selectedFormat, visibleColumnIds);
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Asset Group Management"
          subtitle="Manage asset group information and settings"
          customActions={
            <div className="flex items-center gap-2">
              <SelectDropdown
                value={selectedFormat}
                onChange={(value) => { setSelectedFormat(value as 'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'); }}
                options={exportOptions}
                placeholder="Select format"
                buttonVariant="outline"
                buttonSize="sm"
                className="min-w-[100px]"
              />
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
                title={`Export as ${selectedFormat.toUpperCase()}`}
              >
                <ExportFile className="w-4 h-4" />
                Export Data
              </button>
            </div>
          }
        />

        <AssetGroupsSearchAndFilter
          searchValue={filters.searchValue}
          onSearchChange={(value) => { updateFilters({ searchValue: value }); }}
          onClearFilters={() => { updateFilters({ searchValue: '' }); }}
        />

        <div className="flex-1 overflow-hidden">
          <AssetGroupsTable
            assetGroups={filteredAssetGroups}
            selectedIds={selectedAssetGroupIds}
            assetCounts={assetGroupAssetCounts}
            onSelectAssetGroup={toggleAssetGroupSelection}
            onAddAssetGroup={handleAddAssetGroup}
            onEditAssetGroup={handleEditAssetGroup}
            onDeleteSelected={() => { handleDeleteMultipleAssetGroups(selectedAssetGroupIds); }}
            hasSingleSelection={selectedAssetGroupIds.length === 1}
            onVisibleColumnsChange={handleVisibleColumnsChange}
          />
        </div>

        <AssetGroupFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editingAssetGroup={editingAssetGroup}
          onSave={handleSaveAssetGroup}
          validationErrors={formErrors}
          existingAssetGroups={assetGroups}
          clearValidationErrors={clearFormErrors}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainAssetGroupPage;