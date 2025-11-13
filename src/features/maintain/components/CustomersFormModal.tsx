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
import { Button } from '@/components/ui/components/Button';
import SelectDropdown from '@/components/SelectDropdown';
import type {
  Customer,
  CustomerFormData,
  CustomerValidationErrors,
} from '../types/customers';
import { validateCustomerForm, generateCustomerCode } from '../utils/customerUtils';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomerFormData) => Promise<void> | void;
  editingCustomer?: Customer | null;
  existingCustomers: Customer[];
}

const initialFormState: CustomerFormData = {
  name: '',
  code: '',
  contactPerson: '',
  email: '',
  phone: '',
  status: 'Active',
};

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCustomer,
  existingCustomers,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>(initialFormState);
  const [errors, setErrors] = useState<CustomerValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        code: editingCustomer.code,
        contactPerson: editingCustomer.contactPerson,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        status: editingCustomer.status,
      });
      setErrors({});
      setSubmitError('');
    } else if (isOpen) {
      const newCode = generateCustomerCode(existingCustomers);
      setFormData({ ...initialFormState, code: newCode });
      setErrors({});
      setSubmitError('');
    }
  }, [editingCustomer, existingCustomers, isOpen]);

  const handleInputChange = (
    field: keyof CustomerFormData,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'name' || field === 'email' || field === 'status') {
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

    const validationErrors = validateCustomerForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while saving.');
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

  const isEditMode = Boolean(editingCustomer);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update customer details.'
              : 'Enter details for the new customer.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerCode" className="block text-sm font-medium text-onSurface mb-1">
                Customer Code
              </label>
              <Input
                id="customerCode"
                value={formData.code}
                readOnly
                className="bg-surfaceContainerHighest cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-onSurface mb-1">
                Customer Name <span className="text-error">*</span>
              </label>
              <Input
                id="customerName"
                value={formData.name}
                onChange={(event) => { handleInputChange('name', event.target.value); }}
                placeholder="e.g., Global Tech Inc."
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-onSurface mb-1">
                Contact Person
              </label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(event) => { handleInputChange('contactPerson', event.target.value); }}
                placeholder="e.g., Jane Doe"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-onSurface mb-1" >
                Status <span className="text-error">*</span>
              </label>
              <SelectDropdown
                value={formData.status}
                onChange={(value) => {
                  handleInputChange('status', value as 'Active' | 'Inactive');
                }}
                options={[
                  { value: 'Active', label: 'Active' , disabled: formData.status === 'Active'},
                  { value: 'Inactive', label: 'Inactive' , disabled: formData.status === 'Inactive'},
                ]}
                placeholder="Active"
                className={`w-full ${errors.status ? 'border-error' : ''}`}
              />
              {errors.status && <p className="text-sm text-error mt-1">{errors.status}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-onSurface mb-1">
                Phone
              </label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(event) => { handleInputChange('phone', event.target.value); }}
                placeholder="e.g., +1-555-1234"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-onSurface mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) => { handleInputChange('email', event.target.value); }}
                placeholder="e.g., contact@example.com"
                className={errors.email ? 'border-error' : ''}
              />
              {errors.email && <p className="text-sm text-error mt-1">{errors.email}</p>}
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Customer' : 'Save Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};