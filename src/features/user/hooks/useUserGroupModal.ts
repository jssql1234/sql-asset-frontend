import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { userGroupFormSchema, type UserGroupFormData } from '../zod/userGroupForm';
import { useUserContext } from '@/context/UserContext';
import type { UserGroup } from '@/types/user-group';

export function useUserGroupModal(
  editingGroup: UserGroup | null,
  onSave: (groupData: UserGroup, onSuccess?:() => void) => void,
  handleCancel: () => void
) {

  const { groups } = useUserContext();
  
  const form = useForm<UserGroupFormData>({
    resolver: zodResolver(userGroupFormSchema),
    defaultValues: { id: '', name: '', description: '' }
  });

  // Reset form when editing group changes
  useEffect(() => {
    if (editingGroup) {
      form.reset({
        id: editingGroup.id,
        name: editingGroup.name,
        description: editingGroup.description,
      });
    } else {
      form.reset({ id: '', name: '', description: '' });
    }
  }, [editingGroup, form]);

  const handleSubmit = form.handleSubmit((data: UserGroupFormData) => {
    // Duplicate ID validation
    if (!editingGroup && groups.some(g => g.id === data.id)) {
      form.setError('id', {
        type: 'manual',
        message: 'Group ID already exists. Please choose a different ID.',
      });
      return;
    }

    const groupData: UserGroup = {
      id: editingGroup?.id ?? data.id,
      name: data.name,
      description: data.description ?? "",
      defaultPermissions: editingGroup?.defaultPermissions ?? {},
    };

    onSave(groupData, () => {form.reset();});
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  return {
    form,
    handleFormSubmit,
    handleCancel,
  };
}
