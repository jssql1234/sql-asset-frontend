import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/components/Button';
import { Input } from '@/components/ui/components/Input/Input';
import { TextArea } from '@/components/ui/components/Input/TextArea';
import { FileInput } from '@/components/ui/components/Input/FileInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/components/Dialog';
import { SearchWithDropdown } from '@/components/SearchWithDropdown';
import SelectDropdown from '@/components/SelectDropdown';
import { useToast } from '@/components/ui/components/Toast/useToast';

import { useUserManagement } from '../hooks/useUserManagement';
import { workRequestService } from '../services/workRequestService';
import { MOCK_ASSETS } from '../../work-order/mockData';

import type { 
  WorkRequest, 
  CreateWorkRequestForm,
} from '@/types/work-request';

interface CreateWorkRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (workRequest: WorkRequest) => void;
}

export const CreateWorkRequestModal: React.FC<CreateWorkRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, isGuestUser } = useUserManagement();
  const { addToast } = useToast();

  // Form state for create work request
  const [createForm, setCreateForm] = useState<Partial<CreateWorkRequestForm>>({
    technicianName: '',
    department: '',
    requestType: undefined,
    problemDescription: '',
    additionalNotes: '',
  });

  // Validation error states
  const [errors, setErrors] = useState({
    technicianName: false,
    department: false,
    selectedAssets: false,
    requestType: false,
    problemDescription: false,
  });

  // SearchWithDropdown state
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [uploadedPhotos, setUploadedPhotos] = useState<FileList | null>(null);

  // Asset categories for SearchWithDropdown
  const assetCategories = [
    { id: "all", label: "All Categories" },
    { id: "heavy", label: "Heavy Equipment", sublabel: "qty: 2" },
    { id: "power", label: "Power Equipment", sublabel: "Generators, Compressors" },
    { id: "material", label: "Material Handling", sublabel: "Forklifts" },
    { id: "tools", label: "Tools & Machinery", sublabel: "Welding Machines" },
  ];

  // Update form fields when user changes
  useEffect(() => {
    if (isGuestUser) {
      setCreateForm(prev => ({
        ...prev,
        technicianName: '',
        department: 'Guest',
      }));
    } else {
      setCreateForm(prev => ({
        ...prev,
        technicianName: currentUser.name,
        department: currentUser.department,
      }));
    }
  }, [currentUser, isGuestUser]);

  const handleAssetSelectionChange = (assetIds: string[]) => {
    setSelectedAssets(assetIds);
  };

  const handleCreateWorkRequest = useCallback(async () => {
    try {
      // Validate all required fields
      const newErrors = {
        technicianName: !createForm.technicianName?.trim(),
        department: !createForm.department?.trim(),
        selectedAssets: selectedAssets.length === 0,
        requestType: !createForm.requestType,
        problemDescription: !createForm.problemDescription?.trim(),
      };

      setErrors(newErrors);

      // Check if there are any errors
      if (Object.values(newErrors).some(error => error)) {
        return;
      }

      const newWorkRequest = workRequestService.createWorkRequest({
        requesterName: createForm.technicianName!,
        department: createForm.department!,
        selectedAssets: selectedAssets.map(id => {
          const asset = MOCK_ASSETS.find(a => a.id === id);
          return asset ? {
            main: {
              code: asset.code,
              name: asset.name,
              description: asset.name, // Use name as description since it's not available
              location: 'Unknown' // Default location since it's not available
            }
          } : null;
        }).filter(asset => asset !== null) as WorkRequest['selectedAssets'],
        requestType: createForm.requestType!,
        problemDescription: createForm.problemDescription!,
        additionalNotes: createForm.additionalNotes,
        status: 'Pending',
        photos: uploadedPhotos ? Array.from(uploadedPhotos).map((file, index) => ({
          id: `temp-${Date.now()}-${index}`,
          filename: file.name,
          url: URL.createObjectURL(file),
          uploadDate: new Date().toISOString(),
        })) : [],
      });

      // Reset form
      setCreateForm({
        technicianName: isGuestUser ? '' : currentUser.name,
        department: isGuestUser ? 'Guest' : currentUser.department,
        requestType: undefined,
        problemDescription: '',
        additionalNotes: '',
      });
      setSelectedAssets([]);
      setSelectedCategory("all");
      setUploadedPhotos(null);
      setErrors({
        technicianName: false,
        department: false,
        selectedAssets: false,
        requestType: false,
        problemDescription: false,
      });
      
      onSuccess(newWorkRequest);
      onClose();

      addToast({
        title: "Work Request Created Successfully",
        description: `Request ID: ${newWorkRequest.requestId}`,
        variant: "success",
        duration: 7000,
      });
    } catch (error) {
      console.error('Error creating work request:', error);
      addToast({
        title: "Error Creating Work Request",
        description: "An error occurred while creating the work request. Please try again.",
        variant: "error",
        duration: 10000,
      });
    }
  }, [createForm, selectedAssets, uploadedPhotos, isGuestUser, currentUser, onSuccess, onClose, addToast]);

  const handleClose = useCallback(() => {
    // Reset form when closing
    setCreateForm({
      technicianName: isGuestUser ? '' : currentUser.name,
      department: isGuestUser ? 'Guest' : currentUser.department,
      requestType: undefined,
      problemDescription: '',
      additionalNotes: '',
    });
    setSelectedAssets([]);
    setSelectedCategory("all");
    setUploadedPhotos(null);
    setErrors({
      technicianName: false,
      department: false,
      selectedAssets: false,
      requestType: false,
      problemDescription: false,
    });
    onClose();
  }, [isGuestUser, currentUser, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Request</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-onSurface">
                Requester Name <span className="text-error">*</span>
              </label>
              <Input
                type="text"
                value={createForm.technicianName || ''}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, technicianName: e.target.value }));
                  if (errors.technicianName && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, technicianName: false }));
                  }
                }}
                placeholder={isGuestUser ? 'Enter your name' : ''}
                disabled={!isGuestUser}
                className={`${!isGuestUser ? 'bg-surfaceContainerHigh' : ''} ${errors.technicianName ? 'border-error focus-visible:ring-error' : ''}`}
              />
              {errors.technicianName && (
                <p className="text-error body-small">Please enter requester name</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-onSurface">
                Department <span className="text-error">*</span>
              </label>
              <Input
                type="text"
                value={createForm.department || ''}
                onChange={(e) => {
                  setCreateForm(prev => ({ ...prev, department: e.target.value }));
                  if (errors.department && e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, department: false }));
                  }
                }}
                disabled={!isGuestUser}
                className={`bg-surfaceContainerHigh ${errors.department ? 'border-error focus-visible:ring-error' : ''}`}
              />
              {errors.department && (
                <p className="text-error body-small">Please enter department</p>
              )}
            </div>
          </div>

          {/* Asset Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Search Assets <span className="text-error">*</span>
            </label>
            <SearchWithDropdown
              categories={assetCategories}
              selectedCategoryId={selectedCategory}
              onCategoryChange={setSelectedCategory}
              items={MOCK_ASSETS.map((asset) => ({
                id: asset.id,
                label: asset.name,
                sublabel: asset.code,
              }))}
              selectedIds={selectedAssets}
              onSelectionChange={(assetIds) => {
                handleAssetSelectionChange(assetIds);
                if (errors.selectedAssets && assetIds.length > 0) {
                  setErrors(prev => ({ ...prev, selectedAssets: false }));
                }
              }}
              placeholder="Search asset by name or ID..."
              emptyMessage="No assets found"
            />
            {errors.selectedAssets && (
              <p className="text-error body-small">Please select at least one asset</p>
            )}
          </div>

          {/* Request Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Request Type <span className="text-error">*</span>
            </label>
            <SelectDropdown
              value={createForm.requestType || ''}
              onChange={(value) => {
                setCreateForm(prev => ({ ...prev, requestType: value as WorkRequest['requestType'] }));
                if (errors.requestType && value) {
                  setErrors(prev => ({ ...prev, requestType: false }));
                }
              }}
              options={[
                { value: '', label: 'Select Type', disabled: true },
                { value: 'Maintenance', label: 'Maintenance' },
                { value: 'Repair', label: 'Repair' },
                { value: 'Inspection', label: 'Inspection' },
                { value: 'Emergency', label: 'Emergency' },
              ]}
              placeholder="Select Type"
              className={`w-full ${errors.requestType ? 'border-error' : ''}`}
            />
            {errors.requestType && (
              <p className="text-error body-small">Please select a request type</p>
            )}
          </div>

          {/* Problem Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Problem Description <span className="text-error">*</span>
            </label>
            <TextArea
              value={createForm.problemDescription || ''}
              onChange={(e) => {
                setCreateForm(prev => ({ ...prev, problemDescription: e.target.value }));
                if (errors.problemDescription && e.target.value.trim()) {
                  setErrors(prev => ({ ...prev, problemDescription: false }));
                }
              }}
              placeholder="Describe the problem or maintenance needed..."
              rows={4}
              className={errors.problemDescription ? 'border-error focus-visible:ring-error' : ''}
              errorMsg={errors.problemDescription ? 'Please provide a problem description' : undefined}
            />
          </div>

          {/* Upload Photos */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Upload Photos
            </label>
            <FileInput
              label=""
              fileHint="Upload photos related to the problem (optional)"
              fileValue={uploadedPhotos}
              onFilesChange={setUploadedPhotos}
              accept="image/*"
              multiple
              isPreviewUrl={true}
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Additional Notes
            </label>
            <TextArea
              value={createForm.additionalNotes || ''}
              onChange={(e) => setCreateForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any additional information or special requirements..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateWorkRequest}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};