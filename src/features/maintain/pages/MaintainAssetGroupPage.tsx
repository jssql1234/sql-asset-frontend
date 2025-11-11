import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import SelectDropdown from '@/components/SelectDropdown';
import type { SelectDropdownOption } from '@/components/SelectDropdown';
import type { ColumnDef } from '@tanstack/react-table';
import Search from '@/components/Search';
import { AssetGroupsTable } from '../components/AssetGroupsTable';
import AssetGroupFormModal from '../components/AssetGroupFormModal';
import { useAssetGroups } from '../hooks/useAssetGroups';
import { ExportFile } from '@/assets/icons';
import type { AssetGroup } from '../types/assetGroups';
import { Button } from '@/components/ui/components';
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

const MaintainAssetGroupPage: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'>('pdf');
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetGroupsToDelete, setAssetGroupsToDelete] = useState<AssetGroup | null>(null);

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
    filters,
    isModalOpen,
    editingAssetGroup,
    formErrors,
    updateFilters,
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

  const handleDeleteClick = (assetGroup: AssetGroup) => {
    setAssetGroupsToDelete(assetGroup);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assetGroupsToDelete) {
      handleDeleteMultipleAssetGroups([assetGroupsToDelete.id]);
    }
    setDeleteDialogOpen(false);
    setAssetGroupsToDelete(null);
  };
  
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAssetGroupsToDelete(null);
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
                onChange={(value) =>
                  setSelectedFormat(
                    value as 'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'
                  )
                }
                options={exportOptions}
                placeholder="Select format"
                buttonVariant="outline"
                buttonSize="sm"
                className="min-w-[100px]"
              />

              <Button
                type="button"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <ExportFile className="w-4 h-4" />
                Export Data
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleAddAssetGroup}
                className="flex items-center gap-2"
              >
                Add Group
              </Button>
            </div>
          }
        />

        <div className="flex-1 overflow-hidden">
          <AssetGroupsTable
            assetGroups={filteredAssetGroups}
            assetCounts={assetGroupAssetCounts}
            onAddAssetGroup={handleAddAssetGroup}
            onEditAssetGroup={handleEditAssetGroup}
            onDeleteSelected={handleDeleteClick} 
            onVisibleColumnsChange={handleVisibleColumnsChange}
            renderToolbar={({ columnVisibility, actions }) => (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {columnVisibility}
                  </div>

                  <Search
                    searchValue={filters.searchValue || ''}
                    onSearch={(value: string) => updateFilters({ searchValue: value })}
                    searchPlaceholder="Search Asset Groups"
                    live={true}
                    className="w-80"
                    inputClassName="h-10 w-full"
                    showLiveSearchIcon
                  />
                </div>

                {actions && (
                  <div className="flex items-center justify-end gap-2">
                    {actions}
                  </div>
                )}
              </div>
            )}
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

        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Asset Group"
          description={`Are you sure you want to delete "${assetGroupsToDelete?.name}"? This action cannot be undone.`}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainAssetGroupPage;