import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { SearchableDropdown } from "@/components/SearchableDropdown";
import type { WorkOrder, WorkOrderFormData, MaintenanceType, MaintenancePriority, MaintenanceStatus, ServiceBy } from "../types";
import { MOCK_ASSETS, MOCK_TECHNICIANS, MOCK_VENDORS, MAINTENANCE_TYPES, PRIORITY_LEVELS, STATUS_OPTIONS } from "../mockData";

interface EditWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkOrderFormData) => void;
  workOrder: WorkOrder | null;
}

export const EditWorkOrderModal: React.FC<EditWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  workOrder,
}) => {
  const [formData, setFormData] = useState<WorkOrderFormData>({
    workOrderNumber: "",
    assetId: "",
    assetName: "",
    jobTitle: "",
    description: "",
    type: "Preventive",
    priority: "Normal",
    scheduledDate: "",
    scheduledStartDateTime: "",
    scheduledEndDateTime: "",
    actualStartDateTime: "",
    actualEndDateTime: "",
    serviceBy: "In-House",
    assignedTo: "",
    estimatedCost: 0,
    actualCost: 0,
    notes: "",
    status: "Pending",
  });

  const [selectedAssets, setSelectedAssets] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<Array<{ id: string; name: string }>>(MOCK_TECHNICIANS);

  // Filter out already selected assets from the dropdown
  const availableAssets = useMemo(() => {
    const selectedAssetIds = new Set(selectedAssets.map(asset => asset.id));
    return MOCK_ASSETS.filter(asset => !selectedAssetIds.has(asset.id));
  }, [selectedAssets]);

  // Populate form when workOrder changes
  useEffect(() => {
    if (workOrder) {
      setFormData({
        workOrderNumber: workOrder.workOrderNumber,
        assetId: workOrder.assetId,
        assetName: workOrder.assetName,
        jobTitle: workOrder.jobTitle,
        description: workOrder.description,
        type: workOrder.type,
        priority: workOrder.priority,
        scheduledDate: workOrder.scheduledDate || "",
        scheduledStartDateTime: workOrder.scheduledStartDateTime || "",
        scheduledEndDateTime: workOrder.scheduledEndDateTime || "",
        actualStartDateTime: workOrder.actualStartDateTime || "",
        actualEndDateTime: workOrder.actualEndDateTime || "",
        serviceBy: workOrder.serviceBy,
        assignedTo: workOrder.assignedTo,
        estimatedCost: workOrder.estimatedCost || 0,
        actualCost: workOrder.actualCost || 0,
        notes: workOrder.notes || "",
        status: workOrder.status,
      });

      // Parse selected assets from workOrder
      const assetIds = workOrder.assetId.split(',');
      const assetNames = workOrder.assetName.split(',');
      const assets = assetIds.map((id, index) => {
        const asset = MOCK_ASSETS.find(a => a.id === id.trim());
        return {
          id: id.trim(),
          name: assetNames[index]?.trim() || asset?.name || id.trim(),
          code: asset?.code || id.trim(),
        };
      });
      setSelectedAssets(assets);
    }
  }, [workOrder]);

  // Update assignee options based on service type
  useEffect(() => {
    if (formData.serviceBy === "In-House") {
      setAssigneeOptions(MOCK_TECHNICIANS);
    } else if (formData.serviceBy === "Outsourced") {
      setAssigneeOptions(MOCK_VENDORS);
    }
  }, [formData.serviceBy]);

  const handleAssetSelect = (assetId: string) => {
    const asset = MOCK_ASSETS.find(a => a.id === assetId);
    if (asset && !selectedAssets.find(a => a.id === assetId)) {
      const updatedAssets = [...selectedAssets, asset];
      setSelectedAssets(updatedAssets);
      
      // Update form data
      if (updatedAssets.length === 1) {
        setFormData(prev => ({
          ...prev,
          assetId: asset.id,
          assetName: asset.name,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          assetId: updatedAssets.map(a => a.id).join(','),
          assetName: updatedAssets.map(a => a.name).join(', '),
        }));
      }
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    const updatedAssets = selectedAssets.filter(a => a.id !== assetId);
    setSelectedAssets(updatedAssets);
    
    // Update form data
    if (updatedAssets.length === 0) {
      setFormData(prev => ({
        ...prev,
        assetId: "",
        assetName: "",
      }));
    } else if (updatedAssets.length === 1) {
      setFormData(prev => ({
        ...prev,
        assetId: updatedAssets[0].id,
        assetName: updatedAssets[0].name,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assetId: updatedAssets.map(a => a.id).join(','),
        assetName: updatedAssets.map(a => a.name).join(', '),
      }));
    }
  };

  const handleClearAllAssets = () => {
    setSelectedAssets([]);
    setFormData(prev => ({
      ...prev,
      assetId: "",
      assetName: "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (selectedAssets.length === 0 || !formData.jobTitle || !formData.scheduledStartDateTime || !formData.scheduledEndDateTime) {
      alert("Please fill in all required fields (at least one asset must be selected)");
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

    // If status is completed, require actual end datetime
    if (formData.status === "Completed" && !formData.actualEndDateTime) {
      alert("Actual end date & time is required for completed work orders");
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedAssets([]);
    onClose();
  };

  if (!workOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[800px] max-w-[90vw] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outlineVariant">
          <h2 className="headline-small font-semibold text-onSurface">
            Edit Work Order
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            {/* Basic Information */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Work Order Number
                  </label>
                  <Input
                    value={formData.workOrderNumber}
                    disabled
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Search Assets <span className="text-error">*</span>
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <SearchableDropdown
                          items={availableAssets.map((asset) => ({
                            id: asset.id,
                            label: asset.name,
                            sublabel: asset.code,
                          }))}
                          selectedId=""
                          onSelect={handleAssetSelect}
                          placeholder="Search asset by name or ID"
                          emptyMessage={
                            selectedAssets.length === MOCK_ASSETS.length
                              ? "All assets have been selected"
                              : "No assets found"
                          }
                          searchInDropdown={true}
                        />
                      </div>
                      {selectedAssets.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllAssets}
                          className="px-4 py-2 rounded bg-error text-onError hover:bg-error/90 transition-colors whitespace-nowrap label-large"
                        >
                          Clear All Assets
                        </button>
                      )}
                    </div>

                    {/* Selected Assets */}
                    <div>
                      <label className="label-medium block mb-2 text-onSurfaceVariant">
                        Selected Assets
                      </label>
                      <div className="h-40 overflow-y-auto border border-outlineVariant rounded p-2 bg-surfaceContainerLowest">
                        {selectedAssets.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="body-small text-onSurfaceVariant italic text-center">
                              No assets selected. Use the search above to add
                              assets.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedAssets.map((asset) => (
                              <div
                                key={asset.id}
                                className="flex items-center justify-between px-3 py-2 bg-surface rounded border border-outlineVariant hover:border-primary/40 transition-colors"
                              >
                                <div className="flex flex-col">
                                  <span className="body-medium font-medium text-onSurface">
                                    {asset.name}
                                  </span>
                                  <span className="body-small text-onSurfaceVariant">
                                    {asset.code}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAsset(asset.id)}
                                  className="ml-2 p-1 rounded hover:bg-errorContainer text-error transition-colors"
                                  title="Remove asset"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Work Details */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">
                Work Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Job Title <span className="text-error">*</span>
                  </label>
                  <Input
                    value={formData.jobTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        jobTitle: e.target.value,
                      }))
                    }
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Detailed description of the work to be performed"
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
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value as MaintenanceType,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                    >
                      {MAINTENANCE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-large block mb-2 text-onSurface">
                      Priority <span className="text-error">*</span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: e.target.value as MaintenancePriority,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                    >
                      {PRIORITY_LEVELS.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-large block mb-2 text-onSurface">
                      Status <span className="text-error">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as MaintenanceStatus,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Resource Assignment */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">
                Resource Assignment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Service By <span className="text-error">*</span>
                  </label>
                  <select
                    value={formData.serviceBy}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceBy: e.target.value as ServiceBy,
                        assignedTo: "", // Reset assignedTo when changing service type
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                  >
                    <option value="In-House">In-House</option>
                    <option value="Outsourced">Outsourced</option>
                  </select>
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Assigned To <span className="text-error">*</span>
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignedTo: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-outline rounded bg-surface text-onSurface"
                  >
                    <option value="">
                      -- Select{" "}
                      {formData.serviceBy === "In-House"
                        ? "Technician"
                        : "Vendor"}{" "}
                      --
                    </option>
                    {assigneeOptions.map((option) => (
                      <option key={option.id} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Schedule & Timeline */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">
                Schedule & Timeline
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Scheduled Start Date & Time{" "}
                    <span className="text-error">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledStartDateTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledStartDateTime: e.target.value,
                      }))
                    }
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Scheduled End Date & Time{" "}
                    <span className="text-error">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledEndDateTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledEndDateTime: e.target.value,
                      }))
                    }
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
                    value={formData.actualStartDateTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        actualStartDateTime: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Actual End Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.actualEndDateTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        actualEndDateTime: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                  <p className="body-small text-onSurfaceVariant mt-1">
                    Required for completed status
                  </p>
                </div>
              </div>
            </section>

            {/* Cost Information */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">
                Cost Information
              </h3>
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
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimatedCost: parseFloat(e.target.value) || 0,
                      }))
                    }
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
                    value={formData.actualCost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        actualCost: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
              </div>
              <p className="body-small text-onSurfaceVariant mt-2">
                Costs are automatically distributed equally among assets when
                actual cost is entered
              </p>
            </section>

            {/* Notes */}
            <section>
              <h3 className="title-medium font-semibold text-onSurface mb-4">
                Notes
              </h3>
              <TextArea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Additional notes or comments..."
                rows={4}
                className="w-full"
              />
            </section>

            {/* Parts Used - Read Only */}
            {workOrder.partsUsed && workOrder.partsUsed.length > 0 && (
              <section>
                <h3 className="title-medium font-semibold text-onSurface mb-4">
                  Parts Used
                </h3>
                <div className="border border-outlineVariant rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surfaceContainerLowest">
                      <tr>
                        <th className="px-4 py-2 text-left label-small text-onSurfaceVariant">
                          Part Name
                        </th>
                        <th></th>
                        <th className="px-4 py-2 text-right label-small text-onSurfaceVariant">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-right label-small text-onSurfaceVariant">
                          Unit Cost (RM)
                        </th>
                        <th className="px-4 py-2 text-right label-small text-onSurfaceVariant">
                          Total (RM)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrder.partsUsed.map((part, index) => (
                        <tr
                          key={index}
                          className="border-t border-outlineVariant"
                        >
                          <td className="px-4 py-2 body-small text-onSurface">
                            {part.partName}
                          </td>
                          <td></td>
                          <td className="px-4 py-2 body-small text-onSurface text-right">
                            {part.quantity}
                          </td>
                          <td className="px-4 py-2 body-small text-onSurface text-right">
                            {part.unitCost.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 body-small text-onSurface text-right font-semibold">
                            {(part.quantity * part.unitCost).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-outlineVariant bg-surfaceContainerLowest">
                        <td
                          colSpan={4}
                          className="px-4 py-2 label-medium text-onSurface text-right"
                        >
                          Total Parts Cost:
                        </td>
                        <td className="px-4 py-2 label-medium text-onSurface text-right font-semibold">
                          RM{" "}
                          {workOrder.partsUsed
                            .reduce(
                              (sum, part) =>
                                sum + part.quantity * part.unitCost,
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
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
              className="px-4 py-2 rounded text-primary hover:bg-primary/10 transition-colors label-large"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary text-onPrimary hover:bg-primary/90 transition-colors label-large"
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