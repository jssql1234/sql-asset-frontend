import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from '@/components/ui/components';
import { Input, TextArea } from '@/components/ui/components/Input';
import type { UserGroup } from '@/types/user-group';

interface UserGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingGroup: UserGroup | null;
  onSave: (groupData: Omit<UserGroup, 'isDefault'>) => void;
}

export const UserGroupModal: React.FC<UserGroupModalProps> = ({
  open,
  onOpenChange,
  editingGroup,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    defaultPermissions: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingGroup) {
      setFormData({
        id: editingGroup.id,
        name: editingGroup.name,
        description: editingGroup.description,
        defaultPermissions: editingGroup.defaultPermissions,
      });
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        defaultPermissions: {},
      });
    }
    setErrors({});
  }, [editingGroup, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) {
      newErrors.id = 'Group ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      id: formData.id.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      defaultPermissions: formData.defaultPermissions,
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingGroup ? 'Edit User Group' : 'Add User Group'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Group ID *
            </label>
            <Input
              value={formData.id}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              placeholder="Enter group ID"
              disabled={!!editingGroup} // Can't change ID when editing any group
            />
            {errors.id && (
              <p className="text-sm text-error mt-1">{errors.id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Group Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter group name"
            />
            {errors.name && (
              <p className="text-sm text-error mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <TextArea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter group description"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingGroup ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};