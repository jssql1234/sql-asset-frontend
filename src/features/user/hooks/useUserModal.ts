import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { userFormSchema, type UserFormData } from '../zod/userForm';
import type { User } from '@/types/user';
import { useUserContext } from '@/context/UserContext';
import type { Location } from '@/features/maintain/types/locations'

export function useUserModal(
  editingUser: User | null,
  open: boolean,
  onOpenChange: (open: boolean) => void,
  onSave: (userData: User, onSuccess?:() => void) => void,
  locations: Location[],
) {

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
    name: '',
    email: '',
    phone: '',
    position: '',
    location: '',
    groupId: '',
    },
  });

  const { groups } = useUserContext();

  // Convert groups to SearchableDropdown format
  const groupItems = useMemo(() => groups.map(group => ({
    id: group.id,
    label: group.name,
  })), [groups]);

  // Convert locations to SearchableDropdown format
  const locationItems = useMemo(() => locations.map(location => ({
    id: location.id,
    label: location.name,
    sublabel: location.id, // Show location ID as sublabel
  })), [locations]);

  useEffect(() => {
    if (editingUser) {
      form.reset({
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone ?? '',
        position: editingUser.position ?? '',
        location: editingUser.location ?? '',
        groupId: editingUser.groupId,
      });
    } else if (open) {
      form.reset({
        name: '',
        email: '',
        phone: '',
        position: '',
        location: '',
        groupId: '',
      });
    }
  }, [editingUser, open, form]);

  const handleSubmit = form.handleSubmit((data: UserFormData)=> {
    const userData: User = {
      id: editingUser?.id ?? `user_${String(Date.now())}`, // Generate ID for new users
      name: data.name,
      email: data.email,
      phone: data.phone ?? undefined,
      position: data.position ?? undefined,
      location: data.location,
      groupId: data.groupId,
    };

    onSave(userData, () => {form.reset();});
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleSubmit();
  };

  return {
    form,
    handleFormSubmit,
    handleCancel,
    groupItems,
    locationItems,
  }
}