import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/components/Dialog';
import { Input } from '@/components/ui/components/Input/Input';
import { TextArea } from '@/components/ui/components/Input/TextArea';
import { Button } from '@/components/ui/components/Button';
import type { SparePart, SparePartFormData, SparePartValidationErrors } from '../types/spareParts';
import { validateSparePartForm, generateSparePartId, getUniqueCategories } from '../utils/sparePartsUtils';

interface SparePartsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SparePartFormData) => Promise<void> | void;
  editingPart?: SparePart | null;
  existingParts: SparePart[];
  validationErrors?: SparePartValidationErrors;
  clearValidationErrors?: () => void;
}

export const SparePartsFormModal: React.FC<SparePartsFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPart,
  existingParts,
  validationErrors,
  clearValidationErrors,
}) => {
  const emptyForm: SparePartFormData = useMemo(() => ({
    id: '',
    name: '',
    description: '',
    category: '',
    stockQty: 0,
    lowStockThreshold: 5,
    unitPrice: 0,
    supplier: '',
    location: '',
    operationalStatus: 'Active',
  }), []);

  const [formData, setFormData] = useState<SparePartFormData>(emptyForm);

  const [errors, setErrors] = useState<SparePartValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const categoryOptions = useMemo(() => getUniqueCategories(existingParts), [existingParts]);

  // Populate form when editing
  useEffect(() => {
    if (!isOpen) {
      setFormData(emptyForm);
      setErrors({});
      setSubmitError('');
      clearValidationErrors?.();
      return;
    }

    if (editingPart) {
      setFormData({
        id: editingPart.id,
        name: editingPart.name,
        description: editingPart.description,
        category: editingPart.category,
        stockQty: editingPart.stockQty,
        lowStockThreshold: editingPart.lowStockThreshold,
        unitPrice: editingPart.unitPrice,
        supplier: editingPart.supplier,
        location: editingPart.location,
        operationalStatus: editingPart.operationalStatus,
      });
      setErrors({});
      setSubmitError('');
      clearValidationErrors?.();
    } else {
      // Generate new ID for new part
      const newId = generateSparePartId(existingParts);
      setFormData(prev => ({
        ...prev,
        id: newId,
      }));
      setErrors({});
      setSubmitError('');
      clearValidationErrors?.();
    }
  }, [editingPart, existingParts, isOpen, clearValidationErrors, emptyForm]);

  useEffect(() => {
    if (validationErrors) {
      setErrors(validationErrors);
    }
  }, [validationErrors]);

  const handleInputChange = (field: keyof SparePartFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof SparePartValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [field as keyof SparePartValidationErrors]: undefined,
      }));
      if (validationErrors?.[field as keyof SparePartValidationErrors]) {
        clearValidationErrors?.();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Validate form
    const validationErrors = validateSparePartForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving spare part:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while saving the spare part.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setErrors({});
    setSubmitError('');
    onClose();
  };

  const isEditMode = !!editingPart;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Spare Part' : 'Add New Spare Part'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the information for this spare part.'
              : 'Enter the details for the new spare part.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-4">
          {/* Part ID and Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="partId" className="block text-sm font-medium text-onSurface mb-1">
                Part ID <span className="text-error">*</span>
              </label>
              <Input
                id="partId"
                value={formData.id}
                onChange={(e) => { handleInputChange('id', e.target.value); }}
                placeholder="e.g., SP001"
                className={errors.id ? 'border-error' : ''}
              />
              {errors.id && (
                <p className="text-sm text-error mt-1">{errors.id}</p>
              )}
            </div>

            <div>
              <label htmlFor="partName" className="block text-sm font-medium text-onSurface mb-1">
                Part Name <span className="text-error">*</span>
              </label>
              <Input
                id="partName"
                value={formData.name}
                onChange={(e) => { handleInputChange('name', e.target.value); }}
                placeholder="e.g., Engine Oil Filter"
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && (
                <p className="text-sm text-error mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Category and Supplier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-onSurface mb-1">
                Category <span className="text-error">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => { handleInputChange('category', e.target.value); }}
                className={`w-full px-3 py-2 border rounded-md bg-surfaceContainerHighest text-onSurface focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.category ? 'border-error' : 'border-outlineVariant'
                }`}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-error mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-onSurface mb-1">
                Supplier
              </label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => { handleInputChange('supplier', e.target.value); }}
                placeholder="Supplier name"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-onSurface mb-1">
              Description
            </label>
            <TextArea
              id="description"
              value={formData.description}
              onChange={(e) => { handleInputChange('description', e.target.value); }}
              placeholder="Detailed description of the part"
              rows={3}
            />
          </div>

          {/* Stock Quantity and Low Stock Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="stockQty" className="block text-sm font-medium text-onSurface mb-1">
                Stock Quantity <span className="text-error">*</span>
              </label>
              <Input
                id="stockQty"
                type="number"
                min="0"
                value={formData.stockQty}
                onChange={(e) => { handleInputChange('stockQty', parseInt(e.target.value) || 0); }}
                placeholder="0"
                className={errors.stockQty ? 'border-error' : ''}
              />
              {errors.stockQty && (
                <p className="text-sm text-error mt-1">{errors.stockQty}</p>
              )}
            </div>

            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-onSurface mb-1">
                Low Stock Alert Level <span className="text-error">*</span>
              </label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => { handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0); }}
                placeholder="5"
                className={errors.lowStockThreshold ? 'border-error' : ''}
              />
              {errors.lowStockThreshold && (
                <p className="text-sm text-error mt-1">{errors.lowStockThreshold}</p>
              )}
            </div>
          </div>

          {/* Unit Price and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-onSurface mb-1">
                Unit Price (RM)
              </label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => { handleInputChange('unitPrice', parseFloat(e.target.value) || 0); }}
                placeholder="0.00"
                className={errors.unitPrice ? 'border-error' : ''}
              />
              {errors.unitPrice && (
                <p className="text-sm text-error mt-1">{errors.unitPrice}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-onSurface mb-1">
                Location
              </label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => { handleInputChange('location', e.target.value); }}
                placeholder="Storage location"
              />
            </div>
          </div>

          {/* Operational Status */}
          <div>
            <label htmlFor="operationalStatus" className="block text-sm font-medium text-onSurface mb-1">
              Operational Status <span className="text-error">*</span>
            </label>
            <select
              id="operationalStatus"
              value={formData.operationalStatus}
              onChange={(e) => { handleInputChange('operationalStatus', e.target.value); }}
              className={`w-full px-3 py-2 border rounded-md bg-surfaceContainerHighest text-onSurface focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.operationalStatus ? 'border-error' : 'border-outlineVariant'
              }`}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Discontinued">Discontinued</option>
            </select>
            {errors.operationalStatus && (
              <p className="text-sm text-error mt-1">{errors.operationalStatus}</p>
            )}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-errorContainer rounded-md border border-error">
              <p className="text-sm text-onErrorContainer">{submitError}</p>
            </div>
          )}

          {/* Stock Status Info */}
          <div className="p-3 bg-surfaceContainerLow rounded-md">
            <p className="text-sm text-onSurfaceVariant">
              <strong>Stock Status:</strong> Automatically calculated based on Stock Quantity and Low Stock Alert Level
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Part' : 'Save Part')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
