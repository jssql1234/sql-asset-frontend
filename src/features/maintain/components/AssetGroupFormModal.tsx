import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/components/Dialog';
import { Button } from '@/components/ui/components';
import { Input } from '@/components/ui/components/Input/Input';
import { TextArea } from '@/components/ui/components/Input/TextArea';
import type {
  AssetGroup,
  AssetGroupFormData,
  AssetGroupValidationErrors,
} from '../types/assetGroups';
import { generateAssetGroupId } from '../utils/assetGroupUtils';

interface AssetGroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAssetGroup: AssetGroup | null;
  onSubmit: (formData: AssetGroupFormData) => boolean | Promise<boolean>;
  errors: AssetGroupValidationErrors;
  existingAssetGroups: AssetGroup[];
  onClearFieldError: (field: keyof AssetGroupValidationErrors) => void;
}

const initialFormState: AssetGroupFormData = {
  id: '',
  name: '',
  description: '',
  status: 'Active',
};

const AssetGroupFormModal: React.FC<AssetGroupFormModalProps> = ({
  isOpen,
  onClose,
  editingAssetGroup,
  onSubmit,
  errors,
  existingAssetGroups,
  onClearFieldError,
}) => {
  const [formData, setFormData] = useState<AssetGroupFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setIsSubmitting(false);
      return;
    }

    if (editingAssetGroup) {
      setFormData({
        id: editingAssetGroup.id,
        name: editingAssetGroup.name,
        description: editingAssetGroup.description,
        status: editingAssetGroup.status,
      });
      return;
    }

    const newId = generateAssetGroupId(existingAssetGroups);
    setFormData({
      id: newId,
      name: '',
      description: '',
      status: 'Active',
    });
  }, [editingAssetGroup, existingAssetGroups, isOpen]);

  const handleClose = () => {
    setFormData(initialFormState);
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (
    field: keyof AssetGroupFormData,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'id' ? value.toUpperCase() : value,
    }));

    if ((field === 'id' || field === 'name') && errors[field]) {
      onClearFieldError(field);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await Promise.resolve(onSubmit(formData));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = Boolean(editingAssetGroup);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Asset Group' : 'Add Asset Group'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details for this asset group.'
              : 'Enter the information for the new asset group.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="assetGroupId" className="block text-sm font-medium text-onSurface mb-1">
                Asset Group Code <span className="text-error">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  id="assetGroupId"
                  value={formData.id}
                  onChange={(event) => { handleInputChange('id', event.target.value); }}
                  placeholder="e.g., AG-001"
                  className={errors.id ? 'border-error' : ''}
                />
                {!isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newId = generateAssetGroupId(existingAssetGroups);
                      handleInputChange('id', newId);
                    }}
                  >
                    Generate
                  </Button>
                )}
              </div>
              {errors.id && <p className="text-sm text-error mt-1">{errors.id}</p>}
            </div>

            <div>
              <label htmlFor="assetGroupStatus" className="block text-sm font-medium text-onSurface mb-1">
                Status
              </label>
              <select
                id="assetGroupStatus"
                value={formData.status}
                onChange={(event) => { handleInputChange('status', event.target.value); }}
                className="w-full px-3 py-2 border rounded-md bg-surfaceContainerHighest text-onSurface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="assetGroupName" className="block text-sm font-medium text-onSurface mb-1">
                Asset Group Name <span className="text-error">*</span>
              </label>
              <Input
                id="assetGroupName"
                value={formData.name}
                onChange={(event) => { handleInputChange('name', event.target.value); }}
                placeholder="e.g., Computer & IT Equipment"
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="assetGroupDescription" className="block text-sm font-medium text-onSurface mb-1">
                Description
              </label>
              <TextArea
                id="assetGroupDescription"
                value={formData.description}
                onChange={(event) => { handleInputChange('description', event.target.value); }}
                placeholder="Describe the assets contained in this group"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEditMode ? 'Update Asset Group' : 'Save Asset Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssetGroupFormModal;
