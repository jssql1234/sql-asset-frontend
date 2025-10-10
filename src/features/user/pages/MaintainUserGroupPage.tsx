import React, { useRef, useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { UserGroupTable } from '../components/UserGroupTable';
import { UserGroupModal } from '../components/UserGroupModal';
import DeleteGroupConfirmationDialog from '../components/DeleteGroupConfirmationDialog';
import { useUserGroupManagement } from '../hooks/useUserGroupManagement';
import * as UserGroupService from '../services/userGroupService';
import { useToast } from '@/components/ui/components/Toast/useToast';
import { ExportFile, Upload } from '@/assets/icons';
import { use } from 'react';
import { UserContext } from '@/context/UserContext';
import type { UserGroup } from '@/types/user-group';
import TabHeader from '@/components/TabHeader';

const MaintainUserGroupPage: React.FC = () => {
  const { addGroup } = use(UserContext);
  const {
    groups,
    isModalOpen,
    editingGroup,
    handleAddGroup,
    handleEditGroup,
    handleDeleteGroup,
    handleSaveGroup,
    handleCloseModal,
  } = useUserGroupManagement();

  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<UserGroup | null>(null);

  const handleDeleteClick = (group: UserGroup) => {
    setGroupToDelete(() => group);
    setDeleteDialogOpen(() => true);
  };

  const handleConfirmDelete = () => {
    if (groupToDelete) {
      handleDeleteGroup(groupToDelete.id);
      setDeleteDialogOpen(() => false);
      setGroupToDelete(() => null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(() => false);
    setGroupToDelete(() => null);
  };

  const handleExportCSV = () => {
    try {
      UserGroupService.exportToCSV(groups);
      addToast({
        variant: 'success',
        title: 'Export Successful',
        description: 'User groups exported to CSV',
      });
    } catch {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // Handle the async operation
    file.text()
      .then(text => {
        const result = UserGroupService.importFromCSV(text);

        if (result.errors.length > 0) {
          addToast({
            variant: 'error',
            title: 'Import Failed',
            description: result.errors.join(', '),
          });
          return;
        }

        // Actually import the groups to the system
        let successCount = 0;
        const errorMessages: string[] = [];

        for (const groupData of result.groups) {
          try {
            // Check if group with this ID already exists
            const existingGroup = groups.find(g => g.id === groupData.id);
            if (existingGroup) {
              errorMessages.push(`Group with ID "${groupData.id}" already exists`);
              continue;
            }

            // Add the group to the system
            addGroup(groupData);
            successCount++;
          } catch (error) {
            errorMessages.push(`Failed to add group "${groupData.id}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        if (successCount > 0) {
          addToast({
            variant: 'success',
            title: 'Import Successful',
            description: `Successfully imported ${successCount.toFixed(0)} group${successCount > 1 ? 's' : ''}`,
          });
        }

        if (errorMessages.length > 0) {
          addToast({
            variant: 'warning',
            title: 'Import Completed with Warnings',
            description: errorMessages.join(', '),
          });
        }
      })
      .catch(() => {
        addToast({
          variant: 'error',
          title: 'Import Failed',
          description: 'Failed to read the CSV file',
        });
      })
      .finally(() => {
        // Clear the input
        event.target.value = '';
      });
  };


  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain User Group" },
      ]}
    >

      <TabHeader
        title="Maintain User Group"
        // subtitle="Maintain User Groups"
        actions={[
          {
            icon: <ExportFile className="h-4 w-4" />,
            label: "Export CSV",
            variant: 'outline',
            className: 'h-9 px-4 py-2',
            onAction: handleExportCSV
          } , {
            icon: <Upload className="h-4 w-4" />,
            label: "Import CSV",
            variant: 'outline',
            className: 'h-9 px-4 py-2',
            onAction: handleImportCSV
          } , {
            label: "Add Group",
            className: 'h-9 px-4 py-2',
            onAction: handleAddGroup
          }
        ]}
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
        <DeleteGroupConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          groupName={groupToDelete?.name ?? ''}
        />
      </div>
    </SidebarHeader>
  );
};

export default MaintainUserGroupPage;