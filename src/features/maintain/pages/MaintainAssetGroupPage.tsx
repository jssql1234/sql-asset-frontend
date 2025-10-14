import React from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import { useToast } from '@/components/ui/components/Toast/useToast';
import AssetGroupsSearchAndFilter from '../components/AssetGroupsSearchAndFilter';
import { AssetGroupsTable } from '../components/AssetGroupsTable';
import AssetGroupFormModal from '../components/AssetGroupFormModal';
import { useAssetGroups } from '../hooks/useAssetGroups';
import type { AssetGroup, AssetGroupFormData } from '../types/assetGroups';
import { ExportFile } from '@/assets/icons';

const MaintainAssetGroupPage: React.FC = () => {
  const {
    assetGroups,
    filteredAssetGroups,
    selectedAssetGroupIds,
    filters,
    isFormModalOpen,
    editingAssetGroup,
    formErrors,
    assetGroupAssetCounts,
    createAssetGroup,
    updateAssetGroup,
    deleteSelectedAssetGroups,
    toggleAssetGroupSelection,
    updateFilters,
    clearFilters,
    openAddModal,
    openEditModal,
    closeFormModal,
    exportData,
    hasSingleSelection,
    clearFormFieldError,
  } = useAssetGroups();

  const { addToast } = useToast();

  const handleAddAssetGroup = () => {
    openAddModal();
  };

  const handleEditAssetGroup = (assetGroup: AssetGroup) => {
    openEditModal(assetGroup);
  };

  

  const handleDeleteSelected = () => {
    if (selectedAssetGroupIds.length === 0) {
      return;
    }

    if (!confirm(`Are you sure you want to delete ${String(selectedAssetGroupIds.length)} selected asset groups?`)) {
      return;
    }

    try {
      deleteSelectedAssetGroups();
      addToast({
        variant: 'success',
        title: 'Selected asset groups deleted successfully',
      });
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Failed to delete selected asset groups',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleFormSubmit = (formData: AssetGroupFormData) => {
    const success = editingAssetGroup
      ? updateAssetGroup(formData)
      : createAssetGroup(formData);

    if (success) {
      addToast({
        variant: 'success',
        title: editingAssetGroup
          ? 'Asset group updated successfully'
          : 'Asset group created successfully',
      });
      closeFormModal();
    } else {
      addToast({
        variant: 'error',
        title: 'Unable to save asset group',
        description: 'Please resolve the highlighted errors and try again.',
      });
    }
    return success;
  };

  const handleExport = () => {
    exportData();
    addToast({
      variant: 'success',
      title: 'Asset groups exported successfully'
    });
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
          onClearFilters={clearFilters}
        />

        <div className="flex-1 overflow-hidden">
          <AssetGroupsTable
            assetGroups={filteredAssetGroups}
            selectedIds={selectedAssetGroupIds}
            assetCounts={assetGroupAssetCounts}
            onSelectAssetGroup={toggleAssetGroupSelection}
            onAddAssetGroup={handleAddAssetGroup}
            onEditAssetGroup={handleEditAssetGroup}
            onDeleteSelected={handleDeleteSelected}
            hasSingleSelection={hasSingleSelection}
          />
        </div>

        <AssetGroupFormModal
          isOpen={isFormModalOpen}
          onClose={closeFormModal}
          editingAssetGroup={editingAssetGroup}
          onSubmit={handleFormSubmit}
          errors={formErrors}
          existingAssetGroups={assetGroups}
          onClearFieldError={clearFormFieldError}
        />
      </div>
    </SidebarHeader>
  );
};

export default MaintainAssetGroupPage;