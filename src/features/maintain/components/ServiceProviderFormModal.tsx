import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/DialogExtended';
import { Input } from '@/components/ui/components/Input/Input';
import { TextArea } from '@/components/ui/components/Input/TextArea';
import { Button } from '@/components/ui/components/Button';
import SelectDropdown from '@/components/SelectDropdown';

import type {
  ServiceProvider,
  ServiceProviderFormData,
  ServiceProviderTypeOption,
  ServiceProviderValidationErrors,
} from '../types/serviceProvider';

import { generateServiceProviderId, validateServiceProviderForm, generateServiceProviderCode } from '../utils/serviceProviderUtils';

interface ServiceProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ServiceProviderFormData) => Promise<void> | void;
  editingServiceProvider?: ServiceProvider | null;
  existingServiceProvider: ServiceProvider[];
  serviceProviderTypes: ServiceProviderTypeOption[];
}

const initialFormState: ServiceProviderFormData = {

  id:   '',
  name: '',
  code: '',
  contactPerson: '',
  email: '',
  phone: '',
  description: '',
  status: '' as 'Active' | 'Inactive',
  createdAt: '',
};

export const ServiceProviderFormModal: React.FC<ServiceProviderFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingServiceProvider,
  existingServiceProvider,
}) => {
  const [formData, setFormData] = useState<ServiceProviderFormData>(initialFormState);
  const [errors, setErrors] = useState<ServiceProviderValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (editingServiceProvider) {
      setFormData({
        id: editingServiceProvider.id,
        name: editingServiceProvider.name,
        code: editingServiceProvider.code,
        contactPerson: editingServiceProvider.contactPerson,
        email: editingServiceProvider.email,
        phone: editingServiceProvider.phone,
        description: editingServiceProvider.description,
        status: editingServiceProvider.status,
        createdAt: editingServiceProvider.createdAt,
      });
      setErrors({});
      setSubmitError('');
    } 
  else if (isOpen) {
      const newTempId = generateServiceProviderId(existingServiceProvider);
      const newCode = generateServiceProviderCode('XXX', existingServiceProvider);
      setFormData({ 
      ...initialFormState, 
      id: newTempId,
      code: newCode, 
    });      
    setErrors({});
    setSubmitError('');
    }
  }, [editingServiceProvider, existingServiceProvider, isOpen]); 

  const handleInputChange = (
    field: keyof ServiceProviderFormData,
    value: string,
  ) => {
       setFormData(prev => ({
       ...prev,
       [field]: value,
     }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    const validationErrors = validateServiceProviderForm(formData);
    console.log('Validation errors:', validationErrors);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      console.log('Form has validation errors');
      return;
    }

    setIsSubmitting(true);
    console.log('Attempting to save:', formData);
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving service provider:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while saving the service provider.');
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

  const isEditMode = Boolean(editingServiceProvider);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Service Provider' : 'Add New Service Provider'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the information for this service provider.'
              : 'Enter the details for the new service provider.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label htmlFor="serviceProviderName" className="block text-sm font-medium text-onSurface mb-1">
                Service Provider Name <span className="text-error">*</span>
              </label>
              <Input
                id="serviceProviderName"
                value={formData.name}
                onChange={(event) => { handleInputChange('name', event.target.value); }}
                placeholder="e.g., XXX Solutions"
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="serviceProviderContact" className="block text-sm font-medium text-onSurface mb-1">
                Contact Person
              </label>
              <Input
                id="serviceProviderContact"
                value={formData.contactPerson}
                onChange={(event) => { handleInputChange('contactPerson', event.target.value); }}
                placeholder="John Doe"
              />
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-onSurface mb-1">
                Email
              </label>
              <Input
                id="email"
                value={formData.email}
                onChange={(event) => { handleInputChange('email', event.target.value); }}
                placeholder="Email"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-onSurface mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(event) => { handleInputChange('phone', event.target.value); }}
                placeholder="Phone number"
              />
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-onSurface mb-1">
              Status <span className="text-error">*</span>
            </label>
              <SelectDropdown
                value={formData.status}
                onChange={(value) => {
                  handleInputChange('status', value);
                  if (errors.status && value) {
                    setErrors(prev => ({ ...prev, status: '' }));
                  }
                }}
                options={[
                  { value: '', label: 'Select Status',disabled: true },
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
                placeholder="Select Type"
                className={`w-full ${errors.status ? 'border-error' : ''}`}
              />
            {errors.status && (
              <p className="text-sm text-error mt-1">{errors.status}</p>
            )}
          </div>

            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-onSurface mb-1">
                Description
              </label>
              <TextArea
                id="description"
                value={formData.description}
                onChange={(event) => { handleInputChange('description', event.target.value); }}
                placeholder="Enter detailed description..."
                className="min-h-[100px] w-full"
              />
          </div>     
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Service Provider' : 'Save Service Provider'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
