import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/components/Dialog';
import { Input } from '@/components/ui/components/Input/Input';
import { TextArea } from '@/components/ui/components/Input/TextArea';
import { Button } from '@/components/ui/components/Button';
import type {
  Department,
  DepartmentFormData,
  DepartmentTypeOption,
  DepartmentValidationErrors,
} from '../types/departments';
import { generateDepartmentId, validateDepartmentForm } from '../utils/departmentUtils';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DepartmentFormData) => Promise<void> | void;
  editingDepartment?: Department | null;
  existingDepartments: Department[];
  departmentTypes: DepartmentTypeOption[];
}

const initialFormState: DepartmentFormData = {
  id: '',
  code: '',
  name: '',
  typeId: '',
  manager: '',
  contact: '',
  description: '',
};

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDepartment,
  existingDepartments,
  departmentTypes,
}) => {
  const [formData, setFormData] = useState<DepartmentFormData>(initialFormState);
  const [errors, setErrors] = useState<DepartmentValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        id: editingDepartment.id,
        code: editingDepartment.code,
        name: editingDepartment.name,
        typeId: editingDepartment.typeId,
        manager: editingDepartment.manager,
        contact: editingDepartment.contact,
        description: editingDepartment.description,
      });
      setErrors({});
      setSubmitError('');
    } else if (isOpen) {
      const newId = generateDepartmentId(existingDepartments);
      setFormData({ ...initialFormState, id: newId });
      setErrors({});
      setSubmitError('');
    }
  }, [editingDepartment, existingDepartments, isOpen]);

  const handleInputChange = (
    field: keyof DepartmentFormData,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'code' || field === 'name' || field === 'typeId') {
      if (errors[field]) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [field]: undefined,
        }));
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    const validationErrors = validateDepartmentForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving department:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while saving the department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const isEditMode = Boolean(editingDepartment);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Department' : 'Add New Department'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the information for this department.'
              : 'Enter the details for the new department.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-onSurface mb-1">
                Department ID
              </label>
              <Input
                id="departmentId"
                value={formData.id}
                readOnly
                className="bg-surfaceContainerHighest cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="departmentCode" className="block text-sm font-medium text-onSurface mb-1">
                Department Code <span className="text-error">*</span>
              </label>
              <Input
                id="departmentCode"
                value={formData.code}
                onChange={(event) => { handleInputChange('code', event.target.value); }}
                placeholder="e.g., IT"
                className={errors.code ? 'border-error' : ''}
              />
              {errors.code && <p className="text-sm text-error mt-1">{errors.code}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departmentName" className="block text-sm font-medium text-onSurface mb-1">
                Department Name <span className="text-error">*</span>
              </label>
              <Input
                id="departmentName"
                value={formData.name}
                onChange={(event) => { handleInputChange('name', event.target.value); }}
                placeholder="e.g., IT Department"
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="departmentType" className="block text-sm font-medium text-onSurface mb-1">
                Department Type <span className="text-error">*</span>
              </label>
              <select
                id="departmentType"
                value={formData.typeId}
                onChange={(event) => { handleInputChange('typeId', event.target.value); }}
                className={`w-full px-3 py-2 border rounded-md bg-surfaceContainerHighest text-onSurface focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.typeId ? 'border-error' : 'border-outlineVariant'
                }`}
              >
                <option value="">Select Type</option>
                {departmentTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.typeId && <p className="text-sm text-error mt-1">{errors.typeId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="departmentManager" className="block text-sm font-medium text-onSurface mb-1">
                Department Manager
              </label>
              <Input
                id="departmentManager"
                value={formData.manager}
                onChange={(event) => { handleInputChange('manager', event.target.value); }}
                placeholder="e.g., John Smith"
              />
            </div>

            <div>
              <label htmlFor="departmentContact" className="block text-sm font-medium text-onSurface mb-1">
                Contact Details
              </label>
              <Input
                id="departmentContact"
                value={formData.contact}
                onChange={(event) => { handleInputChange('contact', event.target.value); }}
                placeholder="Phone number and/or email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="departmentDescription" className="block text-sm font-medium text-onSurface mb-1">
              Description
            </label>
            <TextArea
              id="departmentDescription"
              value={formData.description}
              onChange={(event) => { handleInputChange('description', event.target.value); }}
              placeholder="Describe the department's responsibilities"
              rows={3}
            />
          </div>

          {submitError && (
            <div className="p-3 bg-errorContainer rounded-md border border-error">
              <p className="text-sm text-onErrorContainer">{submitError}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Department' : 'Save Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
