import { useState, useCallback } from 'react';
import { use } from 'react';
import { UserContext } from '@/context/UserContext';
import type { UserGroup } from '@/types/user-group';
import { useToast } from '@/components/ui/components/Toast/useToast';

export const useMaintainUserGroup = () => {
  const { groups, addGroup, updateGroup, deleteGroup } = use(UserContext);
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);

  const handleAddGroup = useCallback(() => {
    setEditingGroup(() => null);
    setIsModalOpen(() => true);
  }, []);

  const handleEditGroup = useCallback((group: UserGroup) => {
    setEditingGroup(() => group);
    setIsModalOpen(() => true);
  }, []);

  const handleDeleteGroup = useCallback((groupId: string) => {
    const success = deleteGroup(groupId);
    if (success) {
      addToast({
        variant: 'success',
        title: 'Success',
        description: 'Group deleted successfully',
      });
    } else {
      addToast({
        variant: 'error',
        title: 'Cannot Delete',
        description: 'Admin group cannot be deleted',
      });
    }
  }, [deleteGroup, addToast]);

  const handleSaveGroup = useCallback((groupData: UserGroup) => {
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
    } catch {
      addToast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to save group',
      });
    }
  }, [editingGroup, updateGroup, addGroup, addToast]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(() => false);
    setEditingGroup(() => null);
  }, []);

  return {
    groups,
    isModalOpen,
    editingGroup,
    handleAddGroup,
    handleEditGroup,
    handleDeleteGroup,
    handleSaveGroup,
    handleCloseModal,
  };
};