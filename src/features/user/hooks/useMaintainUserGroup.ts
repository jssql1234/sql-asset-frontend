import { useState, useCallback, useRef } from 'react';
import { useUserContext } from '@/context/UserContext';
import type { UserGroup } from '@/types/user-group';
import { useToast } from '@/components/ui/components/Toast/useToast';
import { importFromCSV, type CSVConfig, type CSVRow } from '@/utils/csvUtils';
import type { ExportColumn } from '@/utils/exportUtils';
import { exportTableData } from '@/utils/exportUtils';

// User Group CSV configuration
const userGroupCSVConfig: CSVConfig<UserGroup> = {
  headers: ['ID', 'Name', 'Description'],
  filename: 'user-groups.csv',
  transformToRow: (group: UserGroup): CSVRow => ({
    ID: group.id,
    Name: group.name,
    Description: group.description || ''
  }),
  transformFromRow: (row: CSVRow) => {
    const errors: string[] = [];

    const id = row.ID.trim();
    const name = row.Name.trim();
    const description = row.Description.trim() || '';

    if (!id) errors.push('ID is required');
    if (!name) errors.push('Name is required');

    const data: UserGroup = {
      id,
      name,
      description,
      defaultPermissions: {} // Empty permissions for imported groups
    };

    return { data, errors };
  }
}

// User Group export columns for exportUtils
export const userGroupExportColumns: ExportColumn<UserGroup>[] = [
  {
    id: 'id',
    header: 'ID',
    key: 'id',
    getValue: (group: UserGroup) => group.id,
  },
  {
    id: 'name',
    header: 'Name',
    key: 'name',
    getValue: (group: UserGroup) => group.name,
  },
  {
    id: 'description',
    header: 'Description',
    key: 'description',
    getValue: (group: UserGroup) => group.description || '',
  },
];

export const useMaintainUserGroup = () => {
  const { groups, addGroup, updateGroup, deleteGroup } = useUserContext();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<UserGroup | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /*** Add Group ***/ 

  const handleAddGroup = useCallback(() => {
    setEditingGroup(() => null);
    setIsModalOpen(() => true);
  }, []);

  /*** Edit Group ***/ 

  const handleEditGroup = useCallback((group: UserGroup) => {
    setEditingGroup(() => group);
    setIsModalOpen(() => true);
  }, []);

  /*** Save Add/Edited Group ***/ 

  const handleSaveGroup = useCallback((groupData: UserGroup, onSuccess?: () => void) => {
    try {
      if (editingGroup) {
        // Update existing group
        updateGroup(editingGroup.id, groupData);
        addToast({
          variant: 'success',
          title: 'Success',
          description: 'Group updated successfully',
        });
      } else {
        // Add new group
        addGroup(groupData);
        addToast({
          variant: 'success',
          title: 'Success',
          description: 'Group added successfully',
        });
      }
      setIsModalOpen(() => false);
      setEditingGroup(() => null);
      onSuccess?.();
    } catch {
      addToast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to save group',
      });
    }
  }, [editingGroup, updateGroup, addGroup, addToast]);

  /*** Close Add/Edit Modal ***/ 

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(() => false);
    setEditingGroup(() => null);
  }, []);

  /*** Delete Group ***/ 

  const handleDeleteClick = (group: UserGroup) => {
    setGroupToDelete(() => group);
    setDeleteDialogOpen(() => true);
  };

  const handleConfirmDelete = () => {
    if (groupToDelete) {
      handleDeleteGroup(groupToDelete);
      setDeleteDialogOpen(() => false);
      setGroupToDelete(() => null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(() => false);
    setGroupToDelete(() => null);
  };

  const handleDeleteGroup = useCallback((group: UserGroup) => {
    const { success } = deleteGroup(group.id);
    if (success) {
      addToast({
        variant: 'success',
        title: 'Success',
        description: `Group "${group.name}" deleted successfully.`,
      });
    } else {
      addToast({
        variant: 'error',
        title: 'Cannot Delete',
        description: 'Admin group cannot be deleted',
      });
    }
  }, [deleteGroup, addToast]);

  /*** CSV Import/Export ***/ 
  
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
        const result = importFromCSV(text, userGroupCSVConfig);

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

        for (const groupData of result.items) {
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
  
  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };
  
  const handleExportData = (format: string) => {
    try {
      exportTableData(
        groups,
        userGroupExportColumns,
        userGroupExportColumns.map(c => c.id),
        format,
        'user-groups',
        undefined,
        { htmlTitle: 'User Groups Export' }
      );
      addToast({
        variant: 'success',
        title: 'Export Successful',
        description: `User groups exported to ${format.toUpperCase()}`,
      });
    } catch {
      addToast({
        variant: 'error',
        title: 'Export Failed',
        description: `Failed to export user groups to ${format.toUpperCase()}`,
      });
    }
  };

  return {
    groups,
    isModalOpen,
    editingGroup,
    fileInputRef,
    deleteDialogOpen,
    groupToDelete,
    handleAddGroup,
    handleEditGroup,
    handleDeleteGroup,
    handleSaveGroup,
    handleCloseModal,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleExportData,
    handleImportCSV,
    handleFileChange
  };
};