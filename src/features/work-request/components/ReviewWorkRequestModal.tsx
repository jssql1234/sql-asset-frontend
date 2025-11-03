import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/components/Button';
import { Input } from '@/components/ui/components/Input/Input';
import { TextArea } from '@/components/ui/components/Input/TextArea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/components/Dialog';

import { SearchWithDropdown } from '@/components/SearchWithDropdown';
import { Badge } from '@/components/ui/components/Badge';
import { MaintenanceHistoryTable } from './MaintenanceHistoryTable';
import { WorkOrderForm } from '@/features/work-order/components/WorkOrderForm';
import { useToast } from '@/components/ui/components/Toast/useToast';
import { useUpdateWorkRequestStatus } from '../hooks/useWorkRequestService';
import { maintenanceHistoryService } from '../services/workRequestService';
import { getStatusVariant } from '../constants';
import type { 
  WorkRequest,
  MaintenanceHistory
} from '../types';
import type { WorkOrderFormData } from '@/features/work-order/types';

interface ReviewWorkRequestModalProps {
  isOpen: boolean;
  workRequest: WorkRequest | null;
  onClose: () => void;
  onSuccess: () => void;
  onReject: () => void;
  onDelete?: (requestId: string) => void;
}

export const ReviewWorkRequestModal: React.FC<ReviewWorkRequestModalProps> = ({
  isOpen,
  workRequest,
  onClose,
  onSuccess,
  onReject: _onReject,
}) => {
  const { addToast } = useToast();
  const { mutate: updateWorkRequestStatus } = useUpdateWorkRequestStatus();
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistory[]>([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonError, setRejectReasonError] = useState(false);
  const [isWorkOrderFormOpen, setIsWorkOrderFormOpen] = useState(false);
  const [prefilledWorkOrder, setPrefilledWorkOrder] = useState<Partial<WorkOrderFormData> | null>(null);

  // Asset categories for SearchWithDropdown (disabled in review mode)
  const assetCategories = [
    { id: "all", label: "All Assets" },
  ];

  // Convert selected assets to SearchWithDropdown format
  const selectedAssetItems = workRequest?.selectedAssets.map((asset) => ({
    id: asset.main.code,
    label: asset.main.name,
    sublabel: asset.main.code,
  })) || [];

  const selectedAssetIds = workRequest?.selectedAssets.map((asset) => asset.main.code) || [];

  // Load maintenance history when a work request is selected for review
  useEffect(() => {
    if (workRequest && workRequest.selectedAssets.length > 0) {
      const history = maintenanceHistoryService.getMaintenanceHistory(workRequest.selectedAssets);
      setMaintenanceHistory(history);
    } else {
      setMaintenanceHistory([]);
    }
  }, [workRequest]);

  const handleApproveWorkRequest = async () => {
    if (!workRequest) return;

    // Prepare description from work request details
    const description = `Request Type: ${workRequest.requestType}
                        Requester: ${workRequest.requesterName}
                        Department: ${workRequest.department}

                        Problem Description:
                        ${workRequest.problemDescription}

                        ${workRequest.additionalNotes ? `Additional Notes:\n${workRequest.additionalNotes}` : ''}`.trim();

    // Prepare asset IDs from selected assets
    const assetIds = workRequest.selectedAssets.map((asset) => asset.main.code);

    // Generate job title from request type and assets
    const assetNames = workRequest.selectedAssets.map((asset) => asset.main.name).join(', ');
    const jobTitle = `${workRequest.requestType} - ${assetNames.length > 50 ? assetNames.substring(0, 50) + '...' : assetNames}`;

    // Create prefilled work order form data
    const prefilledData: Partial<WorkOrderFormData> = {
      assetId: assetIds.join(','),
      assetName: assetNames,
      jobTitle,
      description,
      type: 'Corrective',
      status: 'Pending',
      serviceBy: 'In-House',
      estimatedCost: 0,
      actualCost: 0,
    };

    setPrefilledWorkOrder(prefilledData);
    setIsWorkOrderFormOpen(true);
  };

  const handleWorkOrderCreated = async (_data: WorkOrderFormData) => {
    if (!workRequest) return;

    // Update work request status to approved
    updateWorkRequestStatus({
      requestId: workRequest.id,
      status: 'Approved',
    }, {
      onSuccess: () => {
        // Close both modals
        setIsWorkOrderFormOpen(false);
        onSuccess();
        onClose();
        
        addToast({
          title: "Success to Approved & Create Work Order",
          variant: "success",
          duration: 5000,
        });
      },
      onError: (error) => {
        console.error('Error updating work request status:', error);
        addToast({
          title: "Partial Success",
          description: "Work order created but failed to update work request status.",
          variant: "warning",
          duration: 7000,
        });
      }
    });
  };

  const handleRejectWorkRequest = async () => {
    if (!rejectReason.trim()) {
      setRejectReasonError(true);
      return;
    }

    if (!workRequest) return;

    updateWorkRequestStatus({
      requestId: workRequest.id,
      status: 'Rejected',
      rejectionReason: rejectReason,
    }, {
      onSuccess: () => {
        setIsRejectModalOpen(false);
        setRejectReason('');
        setRejectReasonError(false);
        onSuccess();
        onClose();
        
        addToast({
          title: "Success to Reject Work Request",
          variant: "success",
          duration: 5000,
        });
      },
      onError: (error) => {
        console.error('Error rejecting work request:', error);
        addToast({
          title: "Error",
          description: "Error rejecting work request. Please try again.",
          variant: "error",
          duration: 7000,
        });
      }
    });
  };

  const handleClose = () => {
    setIsRejectModalOpen(false);
    setRejectReason('');
    setRejectReasonError(false);
    setIsWorkOrderFormOpen(false);
    setPrefilledWorkOrder(null);
    onClose();
  };

  if (!workRequest) return null;

  // Check if work request is approved or rejected
  const isApprovedOrRejected = workRequest.status === 'Approved' || workRequest.status === 'Rejected';

  return (
    <>
      {/* Review Work Request Modal */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-full flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Review Work Request</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 space-y-6 py-4 overflow-y-auto">
            {/* Basic Information */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Request ID</label>
                <Input
                  type="text"
                  value={workRequest.requestId}
                  disabled
                  className="bg-surfaceContainerHigh"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Requester Name</label>
                <Input
                  type="text"
                  value={workRequest.requesterName}
                  disabled
                  className="bg-surfaceContainerHigh"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Department</label>
                <Input
                  type="text"
                  value={workRequest.department}
                  disabled
                  className="bg-surfaceContainerHigh"
                />
              </div>
            </div>

            {/* Selected Assets */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-onSurface">Selected Assets</label>
              <SearchWithDropdown
                categories={assetCategories}
                selectedCategoryId="all"
                onCategoryChange={() => {}} // Disabled, no-op
                items={selectedAssetItems}
                selectedIds={selectedAssetIds}
                onSelectionChange={() => {}} // Disabled, no-op
                placeholder="Assets selected for this request"
                emptyMessage="No assets selected"
                hideSearchField={true}
                disable={true}
              />
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Request Type</label>
                <div className="p-2">
                  {workRequest.requestType}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Current Status</label>
                <div className="p-2">
                  <Badge text={workRequest.status} variant={getStatusVariant(workRequest.status)} />
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-onSurface">Problem Description</label>
              <textarea
                value={workRequest.problemDescription}
                disabled
                rows={4}
                className="w-full px-3 py-2 border border-outlineVariant rounded-md bg-surfaceContainerHigh text-onSurface resize-none"
              />
            </div>

            {/* Additional Notes */}
            {workRequest.additionalNotes && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Additional Notes</label>
                <textarea
                  value={workRequest.additionalNotes}
                  disabled
                  rows={3}
                  className="w-full px-3 py-2 border border-outlineVariant rounded-md bg-surfaceContainerHigh text-onSurface resize-none"
                />
              </div>
            )}

            {/* Uploaded Photos */}
            {workRequest.photos && workRequest.photos.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Uploaded Photos</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {workRequest.photos.map((photo) => (
                    <div key={photo.id} className="space-y-2">
                      <div className="aspect-square border border-outlineVariant rounded-md overflow-hidden bg-surfaceContainerHigh">
                        <img
                          src={photo.url}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance History */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-onSurface">Maintenance History</label>
              <MaintenanceHistoryTable history={maintenanceHistory} />
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 sticky bottom-0 bg-surface border-t border-outlineVariant pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            {isApprovedOrRejected ? (<></>
            ) : (
              // Show Reject and Approve buttons for PENDING status
              <>
                <Button
                  variant="destructive"
                  onClick={() => setIsRejectModalOpen(true)}
                >
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApproveWorkRequest}
                >
                  Approve & Create Work Order
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Order Form */}
      {prefilledWorkOrder && (
        <WorkOrderForm
          isOpen={isWorkOrderFormOpen}
          onClose={() => {
            setIsWorkOrderFormOpen(false);
            setPrefilledWorkOrder(null);
          }}
          onSubmit={handleWorkOrderCreated}
          workOrder={prefilledWorkOrder as any}
          mode="create"
        />
      )}

      {/* Reject Reason Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="w-max-full w-150">
          <DialogHeader>
            <DialogTitle>Reject Work Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-onSurface">
                Rejection Reason <span className="text-error">*</span>
              </label>
              <TextArea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectReasonError && e.target.value.trim()) {
                    setRejectReasonError(false);
                  }
                }}
                placeholder="Please provide a detailed reason for rejecting this work request..."
                rows={4}
                className={rejectReasonError ? 'border-error focus-visible:ring-error' : ''}
                errorMsg={rejectReasonError ? 'Please provide a rejection reason' : undefined}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason('');
                setRejectReasonError(false);
              }}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectWorkRequest}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};