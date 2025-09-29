import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/components/Button';
import { Input } from '@/components/ui/components/Input/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/components/Dialog';

import { AssetSelector } from './AssetSelector';
import { useUserManagement } from '../hooks/useUserManagement';
import { useAssetSelection } from '../hooks/useAssetSelection';
import { workRequestService } from '../services/workRequestService';

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
  
  // Asset selection for create form
  const {
    selectedAssets: createSelectedAssets,
    selectAsset: createSelectAsset,
    removeAsset: createRemoveAsset,
    clearSelectedAssets: createClearAssets,
  } = useAssetSelection();

  // Form state for create work request
  const [createForm, setCreateForm] = useState<Partial<CreateWorkRequestForm>>({
    technicianName: '',
    department: '',
    requestType: undefined,
    problemDescription: '',
    additionalNotes: '',
  });

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

  const handleCreateWorkRequest = useCallback(async () => {
    try {
      if (!createForm.technicianName || !createForm.department || !createForm.requestType || !createForm.problemDescription) {
        alert('Please fill in all required fields.');
        return;
      }

      if (createSelectedAssets.length === 0) {
        alert('Please select at least one asset.');
        return;
      }

      const newWorkRequest = workRequestService.createWorkRequest({
        requesterName: createForm.technicianName,
        department: createForm.department,
        selectedAssets: createSelectedAssets,
        requestType: createForm.requestType,
        problemDescription: createForm.problemDescription,
        additionalNotes: createForm.additionalNotes,
        status: 'Pending',
        photos: [],
      });

      // Reset form
      setCreateForm({
        technicianName: isGuestUser ? '' : currentUser.name,
        department: isGuestUser ? 'Guest' : currentUser.department,
        requestType: undefined,
        problemDescription: '',
        additionalNotes: '',
      });
      createClearAssets();
      
      onSuccess(newWorkRequest);
      onClose();

      alert(`Work request created successfully! Request ID: ${newWorkRequest.requestId}`);
    } catch (error) {
      console.error('Error creating work request:', error);
      alert('Error creating work request. Please try again.');
    }
  }, [createForm, createSelectedAssets, isGuestUser, currentUser, createClearAssets, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    // Reset form when closing
    setCreateForm({
      technicianName: isGuestUser ? '' : currentUser.name,
      department: isGuestUser ? 'Guest' : currentUser.department,
      requestType: undefined,
      problemDescription: '',
      additionalNotes: '',
    });
    createClearAssets();
    onClose();
  }, [isGuestUser, currentUser, createClearAssets, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                onChange={(e) => setCreateForm(prev => ({ ...prev, technicianName: e.target.value }))}
                placeholder={isGuestUser ? 'Enter your name' : ''}
                disabled={!isGuestUser}
                className={!isGuestUser ? 'bg-surfaceContainerHigh' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-onSurface">
                Department <span className="text-error">*</span>
              </label>
              <Input
                type="text"
                value={createForm.department || ''}
                onChange={(e) => setCreateForm(prev => ({ ...prev, department: e.target.value }))}
                disabled={!isGuestUser}
                className="bg-surfaceContainerHigh"
              />
            </div>
          </div>

          {/* Asset Selection */}
          <AssetSelector
            selectedAssets={createSelectedAssets}
            onAssetSelect={createSelectAsset}
            onAssetRemove={createRemoveAsset}
            onClearAll={createClearAssets}
          />

          {/* Request Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Request Type <span className="text-error">*</span>
            </label>
            <select
              value={createForm.requestType || ''}
              onChange={(e) => setCreateForm(prev => ({ ...prev, requestType: e.target.value as WorkRequest['requestType'] }))}
              className="w-full px-3 py-2 border border-outlineVariant rounded-md bg-surface text-onSurface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Type</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Problem Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Problem Description <span className="text-error">*</span>
            </label>
            <textarea
              value={createForm.problemDescription || ''}
              onChange={(e) => setCreateForm(prev => ({ ...prev, problemDescription: e.target.value }))}
              placeholder="Describe the problem or maintenance needed..."
              rows={4}
              className="w-full px-3 py-2 border border-outlineVariant rounded-md bg-surface text-onSurface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-vertical"
            />
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-onSurface">
              Additional Notes
            </label>
            <textarea
              value={createForm.additionalNotes || ''}
              onChange={(e) => setCreateForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any additional information or special requirements..."
              rows={3}
              className="w-full px-3 py-2 border border-outlineVariant rounded-md bg-surface text-onSurface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-vertical"
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