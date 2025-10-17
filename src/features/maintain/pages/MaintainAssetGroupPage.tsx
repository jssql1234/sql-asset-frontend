import React from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import AssetGroupsSearchAndFilter from '../components/AssetGroupsSearchAndFilter';
import { AssetGroupsTable } from '../components/AssetGroupsTable';
import AssetGroupFormModal from '../components/AssetGroupFormModal';
import { useAssetGroups } from '../hooks/useAssetGroups';
import { ExportFile } from '@/assets/icons';

const MaintainAssetGroupPage: React.FC = () => {
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
    exportData();
  };

  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain Asset Group" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Asset Group Management"
          subtitle="Manage asset group information and settings"
          customActions={
            <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
                  title="Export CSV"
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
    </SidebarHeader>
  );
};

export default MaintainAssetGroupPage;