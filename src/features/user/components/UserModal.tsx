import React from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/Dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/DialogExtended';
import { Button } from '@/components/ui/components';
import { Input } from '@/components/ui/components/Input';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import type { User } from '@/types/user';
import { useUserModal } from '../hooks/useUserModal';

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  onSave: (userData: User, onSuccess?: () => void) => void;
  onCreateGroup?: () => void;
  onCreateLocation?: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  open,
  onOpenChange,
  editingUser,
  onSave,
  onCreateGroup,
  onCreateLocation,
}) => {
  
  const { form, handleFormSubmit, handleCancel, groupItems, locationItems } = useUserModal(
    editingUser,
    onOpenChange,
    onSave
  );

  const { register, watch, setValue , formState: { errors } } = form;

  const selectedGroupId = watch('groupId');
  const selectedLocationId = watch('location');

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="h-fit max-h-fit w-2xl max-w-2xl overflow-visible" closeOnBackdropClick>
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Add User'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4 pb-4 h-full flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Name *
              </label>
              <Input
                {...register('name')}
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-sm text-error mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Email *
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-error mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone
              </label>
              <Input
                {...register('phone')}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-error mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Position
              </label>
              <Input
                {...register('position')}
                placeholder="Enter job position/title"
              />
              {errors.position && (
                <p className="text-sm text-error mt-1">{errors.position.message}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Department
              </label>
              <Input
                {...register('department')}
                placeholder="Department management coming soon"
                disabled
              />
              <p className="text-xs text-onSurfaceVariant mt-1">
                Department selection will be available in future updates
              </p>
            </div>

            {/* Location */}
          <div className='col-span-2'>
            <label className="block text-sm font-medium mb-1">
              Location *
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableDropdown
                  items={locationItems}
                  selectedId={selectedLocationId}
                  onSelect={(locationId) => {
                    setValue('location', locationId, { shouldValidate: true });
                  }}
                  placeholder="Select a location"
                  emptyMessage="No location found."
                  searchInDropdown={false}
                  className="w-full"
                  maxHeight="max-h-60"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => {
                  onCreateLocation?.();
                }}
                className="px-3"
              >
                + New
              </Button>
            </div>
            {errors.location && (
              <p className="text-sm text-error mt-1">{errors.location.message}</p>
            )}

          </div>

            {/* User Group */}
            <div className='col-span-2'>
              <label className="block text-sm font-medium mb-1">
                User Group *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableDropdown
                    items={groupItems}
                    selectedId={selectedGroupId}
                    onSelect={(groupId) => {
                      setValue('groupId', groupId, { shouldValidate: true });
                    }}
                    placeholder="Select a user group"
                    emptyMessage="No groups found."
                    searchInDropdown={false}
                    className="w-full"
                    maxHeight="max-h-60"
                    position="top"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => {
                    onCreateGroup?.();
                  }}
                  className="px-3"
                >
                  + New
                </Button>
              </div>
              {errors.groupId && (
                <p className="text-sm text-error mt-1">{errors.groupId.message}</p>
              )}

            </div>
          </div>

          

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};