import React, { useState } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { UserGroupTable } from '../components/UserGroupTable';
import { UserGroupModal } from '../components/UserGroupModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useMaintainUserGroup } from '../hooks/useMaintainUserGroup';
import { ExportFile, Upload } from '@/assets/icons';
import TabHeader from '@/components/TabHeader';
import SelectDropdown from '@/components/SelectDropdown';
import type { SelectDropdownOption } from '@/components/SelectDropdown';

const MaintainUserGroupPage: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'>('csv');

  const exportOptions: SelectDropdownOption[] = [
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'html', label: 'HTML' },
    { value: 'txt', label: 'TXT' },
    { value: 'pdf', label: 'PDF' },
  ];

  const {
    groups,
    isModalOpen,
    editingGroup,
    fileInputRef,
    deleteDialogOpen,
    groupToDelete,
    handleAddGroup,
    handleEditGroup,
    handleSaveGroup,
    handleCloseModal,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleExportData,
    handleImportCSV,
    handleFileChange
  } = useMaintainUserGroup();

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain User Group" },
      ]}
    >

      <TabHeader
        title="Maintain User Group"
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
              onClick={() => { handleExportData(selectedFormat); }}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
              title={`Export as ${selectedFormat.toUpperCase()}`}
            >
              <ExportFile className="w-4 h-4" />
              Export Data
            </button>
            <button
              type="button"
              onClick={handleImportCSV}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
              title="Import CSV"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <button
              type="button"
              onClick={handleAddGroup}
              className="px-3 py-2 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover"
            >
              Add Group
            </button>
          </div>
        }
      />

      <div className="flex flex-col h-full">
        {/* Hidden file input for CSV import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Groups Table */}
        <div className="flex-1">
          <UserGroupTable
            groups={groups}
            onEdit={handleEditGroup}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Add/Edit Modal */}
        <UserGroupModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          editingGroup={editingGroup}
          onSave={handleSaveGroup}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          itemName={groupToDelete?.name ?? ''}
        />
      </div>
      
    </AppLayout>
  );
};

export default MaintainUserGroupPage;
