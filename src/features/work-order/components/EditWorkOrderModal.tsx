import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import type { WorkOrder, MaintenanceType, MaintenancePriority, MaintenanceStatus, ServiceBy } from "../types";
import { MOCK_ASSETS, MOCK_TECHNICIANS, MOCK_VENDORS, MAINTENANCE_TYPES, PRIORITY_LEVELS, STATUS_OPTIONS } from "../mockData";

interface EditWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkOrder) => void;
  workOrder: WorkOrder | null;
}

export const EditWorkOrderModal: React.FC<EditWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  workOrder,
}) => {
  const [formData, setFormData] = useState<WorkOrder | null>(null);
  const [assigneeOptions, setAssigneeOptions] = useState<Array<{ id: string; name: string }>>(MOCK_TECHNICIANS);

  // Initialize form data when work order changes
  useEffect(() => {
    if (workOrder) {
      setFormData({ ...workOrder });
    }
  }, [workOrder]);

  // Update assignee options based on service type
  useEffect(() => {
    if (formData?.serviceBy === "In-House") {
      setAssigneeOptions(MOCK_TECHNICIANS);
    } else if (formData?.serviceBy === "Outsourced") {
      setAssigneeOptions(MOCK_VENDORS);
    }
  }, [formData?.serviceBy]);

  if (!formData) return null;

  const handleAssetChange = (assetId: string) => {
    const asset = MOCK_ASSETS.find(a => a.id === assetId);
    setFormData(prev => prev ? {
      ...prev,
      assetId,
      assetName: asset?.name || "",
      assetCode: asset?.code || "",
    } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.assetId || !formData.jobTitle || !formData.scheduledStartDateTime || !formData.scheduledEndDateTime) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate that scheduled end is after scheduled start
    if (formData.scheduledEndDateTime && formData.scheduledStartDateTime && 
        new Date(formData.scheduledEndDateTime) <= new Date(formData.scheduledStartDateTime)) {
      alert("Scheduled end date & time must be after start date & time");
      return;
    }

    // Validate actual dates if provided
    if (formData.actualEndDateTime && formData.actualStartDateTime &&
        new Date(formData.actualEndDateTime) <= new Date(formData.actualStartDateTime)) {
      alert("Actual end date & time must be after start date & time");
      return;
    }

    // Validate completed status requires actual end datetime
    if (formData.status === "Completed" && !formData.actualEndDateTime) {
      alert("Actual end date & time is required for completed work orders");
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[900px] max-w-[90vw] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outlineVariant">
          <h2 className="headline-small font-semibold text-onSurface">Edit Work Order</h2>
          <p className="body-small text-onSurfaceVariant mt-1">{formData.workOrderNumber}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            {/* Basic Information */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Work Order Number
                  </label>
                  <Input
                    value={formData.workOrderNumber}
                    disabled
                    className="w-full bg-surfaceVariant"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Asset <span className="text-error">*</span>
                  </label>
                  <select
                    value={formData.assetId}
                    onChange={(e) => handleAssetChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                  >
                    <option value="">-- Select Asset --</option>
                    {MOCK_ASSETS.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Work Details */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">Work Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Job Title <span className="text-error">*</span>
                  </label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, jobTitle: e.target.value }) : null)}
                    placeholder="Brief description of the work"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Description
                  </label>
                  <TextArea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                    placeholder="Detailed description of the work"
                    rows={3}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label-large block mb-2 text-onSurface">
                      Maintenance Type <span className="text-error">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, type: e.target.value as MaintenanceType }) : null)}
                      required
                      className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                    >
                      {MAINTENANCE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-large block mb-2 text-onSurface">
                      Priority <span className="text-error">*</span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, priority: e.target.value as MaintenancePriority }) : null)}
                      required
                      className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                    >
                      {PRIORITY_LEVELS.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-large block mb-2 text-onSurface">
                      Status <span className="text-error">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => prev ? ({ ...prev, status: e.target.value as MaintenanceStatus }) : null)}
                      required
                      className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Assignment */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">Assignment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Service Type <span className="text-error">*</span>
                  </label>
                  <select
                    value={formData.serviceBy}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, serviceBy: e.target.value as ServiceBy, assignedTo: "" }) : null)}
                    required
                    className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                  >
                    <option value="In-House">In-House</option>
                    <option value="Outsourced">Outsourced</option>
                  </select>
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Assigned To
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, assignedTo: e.target.value }) : null)}
                    className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                  >
                    <option value="">-- Select {formData.serviceBy === "In-House" ? "Technician" : "Vendor"} --</option>
                    {assigneeOptions.map(option => (
                      <option key={option.id} value={option.name}>{option.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Schedule & Timeline */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">Schedule & Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Scheduled Start Date & Time <span className="text-error">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledStartDateTime || ""}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, scheduledStartDateTime: e.target.value }) : null)}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Scheduled End Date & Time <span className="text-error">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledEndDateTime || ""}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, scheduledEndDateTime: e.target.value }) : null)}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Actual Start Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.actualStartDateTime || ""}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, actualStartDateTime: e.target.value }) : null)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Actual End Date & Time {formData.status === "Completed" && <span className="text-error">*</span>}
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.actualEndDateTime || ""}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, actualEndDateTime: e.target.value }) : null)}
                    required={formData.status === "Completed"}
                    className="w-full"
                  />
                  <p className="text-xs text-onSurfaceVariant mt-1">Required for completed status</p>
                </div>
              </div>
            </section>

            {/* Cost Information */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">Cost Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Estimated Cost (RM) <span className="text-error">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }) : null)}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Actual Cost (RM)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.actualCost || 0}
                    onChange={(e) => setFormData(prev => prev ? ({ ...prev, actualCost: parseFloat(e.target.value) || 0 }) : null)}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
              </div>
              {formData.serviceBy === "In-House" && (
                <p className="text-sm text-onSurfaceVariant mt-2">
                  Costs are automatically distributed equally among assets when actual cost is entered
                </p>
              )}
            </section>

            {/* Notes */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">Notes</h3>
              <TextArea
                value={formData.notes || ""}
                onChange={(e) => setFormData(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                placeholder="Additional notes or comments..."
                rows={4}
                className="w-full"
              />
            </section>

            {/* Parts Used */}
            {formData.partsUsed && formData.partsUsed.length > 0 && (
              <section>
                <h3 className="title-medium font-semibold text-onSurface mb-4">Parts Used</h3>
                <div className="border border-outline rounded overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surfaceVariant">
                      <tr>
                        <th className="px-4 py-2 text-left label-large text-onSurface">Part Name</th>
                        <th className="px-4 py-2 text-right label-large text-onSurface">Quantity</th>
                        <th className="px-4 py-2 text-right label-large text-onSurface">Unit Cost</th>
                        <th className="px-4 py-2 text-right label-large text-onSurface">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.partsUsed.map(part => (
                        <tr key={part.id} className="border-t border-outlineVariant">
                          <td className="px-4 py-2 body-medium text-onSurface">{part.partName}</td>
                          <td className="px-4 py-2 text-right body-medium text-onSurface">{part.quantity}</td>
                          <td className="px-4 py-2 text-right body-medium text-onSurface">${part.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right body-medium text-onSurface">${part.totalCost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-outlineVariant flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded text-primary hover:bg-primary/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary text-onPrimary hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkOrderModal;
