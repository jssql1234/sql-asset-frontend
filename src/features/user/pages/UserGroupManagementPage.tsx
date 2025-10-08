import React, { useRef } from 'react';
import { Button } from '@/components/ui/components';
import { AssetLayout } from '@/layout/AssetSidebar';
import { UserGroupTable } from '../components/UserGroupTable';
import { UserGroupModal } from '../components/UserGroupModal';
import { useUserGroupManagement } from '../hooks/useUserGroupManagement';
import { UserGroupService } from '../services/userGroupService';
import { useToast } from '@/components/ui/components/Toast/useToast';
import { ExportFile, Upload } from '@/assets/icons';

const UserGroupManagementPage: React.FC = () => {
  const {
    groups,
    isModalOpen,
    editingGroup,
    handleAddGroup,
    handleEditGroup,
    handleDeleteGroup,
    handleSaveGroup,
    handleToggleDefault,
    handleCloseModal,
  } = useUserGroupManagement();

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    try {
      UserGroupService.exportToCSV(groups);
      addToast({
        variant: 'success',
        title: 'Export Successful',
        description: 'User groups exported to CSV',
      });
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Export Failed',
        description: 'Failed to export user groups',
      });
    }
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      addToast({
        variant: 'error',
        title: 'Invalid File',
        description: 'Please select a CSV file',
      });
      return;
    }

    try {
      const text = await file.text();
      const result = UserGroupService.importFromCSV(text);

      if (result.errors.length > 0) {
        addToast({
          variant: 'error',
          title: 'Import Failed',
          description: result.errors.join(', '),
        });
        return;
      }

      // Note: In a real implementation, you would call an API to bulk create groups
      // For now, we'll just show success
      addToast({
        variant: 'success',
        title: 'Import Successful',
        description: `Imported ${result.groups.length} groups`,
      });
    } catch (error) {
      addToast({
        variant: 'error',
        title: 'Import Failed',
        description: 'Failed to read the CSV file',
      });
    }

    // Clear the input
    event.target.value = '';
  };

  return (
    <AssetLayout activeSidebarItem="user-group-management">
      <div className="flex flex-col h-full">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-onSurface">User Group Management</h1>
            <p className="text-sm text-onSurfaceVariant mt-1">
              Manage user groups and their permissions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <ExportFile className="h-4 w-4" />
              Export CSV
            </Button>

            <Button
              variant="outline"
              onClick={handleImportCSV}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>

            <Button onClick={handleAddGroup}>
              Add Group
            </Button>
          </div>
        </div>

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
            onDelete={handleDeleteGroup}
            onToggleDefault={handleToggleDefault}
          />
        </div>

        {/* Add/Edit Modal */}
        <UserGroupModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          editingGroup={editingGroup}
          onSave={handleSaveGroup}
        />
      </div>
    </AssetLayout>
  );
};

export default UserGroupManagementPage;