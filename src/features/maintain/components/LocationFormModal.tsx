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
import type {
  Location,
  LocationFormData,
  LocationValidationErrors,
} from '../types/locations';
import { generateLocationId, validateLocationForm } from '../utils/locationUtils';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LocationFormData) => Promise<void> | void;
  editingLocation?: Location | null;
  existingLocations: Location[];
}

const initialFormState: LocationFormData = {
  id: '',
  name: '',
  address: '',
  categoryId: '',
  contactPerson: '',
  contactDetails: '',
};

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingLocation,
  existingLocations,
}) => {
  const [formData, setFormData] = useState<LocationFormData>(initialFormState);
  const [errors, setErrors] = useState<LocationValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (editingLocation) {
      setFormData({
        id: editingLocation.id,
        name: editingLocation.name,
        address: editingLocation.address,
        categoryId: editingLocation.categoryId,
        contactPerson: editingLocation.contactPerson,
        contactDetails: editingLocation.contactDetails,
      });
      setErrors({});
      setSubmitError('');
    } else if (isOpen) {
      const newId = generateLocationId(existingLocations);
      setFormData({ ...initialFormState, id: newId });
      setErrors({});
      setSubmitError('');
    }
  }, [editingLocation, existingLocations, isOpen]);

  const handleInputChange = (
    field: keyof LocationFormData,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'name') {
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

    const validationErrors = validateLocationForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving location:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while saving the location.');
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

  const isEditMode = Boolean(editingLocation);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Location' : 'Add New Location'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the information for this location.'
              : 'Enter the details for the new location.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => { void handleSubmit(event); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="locationId" className="block text-sm font-medium text-onSurface mb-1">
                Location ID
              </label>
              <Input
                id="locationId"
                value={formData.id}
                readOnly
                className="bg-surfaceContainerHighest cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="locationName" className="block text-sm font-medium text-onSurface mb-1">
                Location Name <span className="text-error">*</span>
              </label>
              <Input
                id="locationName"
                value={formData.name}
                onChange={(event) => { handleInputChange('name', event.target.value); }}
                placeholder="e.g., Main Warehouse"
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && <p className="text-sm text-error mt-1">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="locationAddress" className="block text-sm font-medium text-onSurface mb-1">
              Address
            </label>
            <TextArea
              id="locationAddress"
              value={formData.address}
              onChange={(event) => { handleInputChange('address', event.target.value); }}
              placeholder="Enter full address"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="locationContactPerson" className="block text-sm font-medium text-onSurface mb-1">
              Contact Person
            </label>
            <Input
              id="locationContactPerson"
              value={formData.contactPerson}
              onChange={(event) => { handleInputChange('contactPerson', event.target.value); }}
              placeholder="e.g., Jane Smith"
            />
          </div>

          <div>
            <label htmlFor="locationContactDetails" className="block text-sm font-medium text-onSurface mb-1">
              Contact Details
            </label>
            <Input
              id="locationContactDetails"
              value={formData.contactDetails}
              onChange={(event) => { handleInputChange('contactDetails', event.target.value); }}
              placeholder="Phone number and/or email"
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
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Location' : 'Save Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
