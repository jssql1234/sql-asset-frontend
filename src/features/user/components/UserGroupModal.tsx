import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/Dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/DialogExtended';
import { Button } from '@/components/ui/components';
import { Input } from '@/components/ui/components/Input';
import { TextArea } from '@/components/ui/components/Input';
import { userGroupFormSchema, type UserGroupFormData } from '../zod/userGroupForm';
import { useUserContext } from '@/context/UserContext';
import type { UserGroup } from '@/types/user-group';

interface UserGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: UserGroup | null;
  onSave: (groupData: UserGroup) => void;
}

export const UserGroupModal: React.FC<UserGroupModalProps> = ({
  open,
  onOpenChange,
  editingGroup,
  onSave,
}) => {
  const { groups } = useUserContext();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserGroupFormData>({
    resolver: zodResolver(userGroupFormSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (editingGroup) {
      reset({
        id: editingGroup.id,
        name: editingGroup.name,
        description: editingGroup.description,
      });
    } else {
      reset({
        id: '',
        name: '',
        description: '',
      });
    }
  }, [editingGroup, reset]);

  const onSubmit = (data: UserGroupFormData) => {
    // Check for duplicate ID when creating new group
    if (!editingGroup) {
      const isDuplicateId = groups.some(g => g.id === data.id);
      if (isDuplicateId) {
        setError('id', {
          type: 'manual',
          message: 'Group ID already exists. Please choose a different ID.',
        });
        return;
      }
    }

    const groupData: UserGroup = {
      id: editingGroup?.id ?? data.id,
      name: data.name,
      description: data.description ?? "",
      defaultPermissions: editingGroup?.defaultPermissions ?? {},
    };

    onSave(groupData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit(onSubmit)();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Edit User Group' : 'Create User Group'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Group ID */}
              {!editingGroup && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Group ID *
                  </label>
                  <Input
                    {...register('id')}
                    placeholder="Enter group ID (e.g., managers, developers)"
                  />
                  {errors.id && (
                    <p className="text-sm text-error mt-1">{errors.id.message}</p>
                  )}
                </div>
              )}

              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Group Name *
                </label>
                <Input
                  {...register('name')}
                  placeholder="Enter group name"
                />
                {errors.name && (
                  <p className="text-sm text-error mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <TextArea
                  {...register('description')}
                  placeholder="Enter group description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-error mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGroup ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };