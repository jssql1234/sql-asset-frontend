import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import SelectDropdown from "@/components/SelectDropdown";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import type { WorkOrder, WorkOrderFormData, MaintenanceType, MaintenancePriority, MaintenanceStatus, ServiceBy, AssetCostAllocation } from "../types";
import { MOCK_ASSETS, MOCK_TECHNICIANS, MOCK_VENDORS, MAINTENANCE_TYPES, PRIORITY_LEVELS, STATUS_OPTIONS } from "../mockData";
import { CostDistribution } from "./CostDistribution";

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
    costAllocations: [],
    notes: "",
    status: "Pending",
  });

  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [assigneeOptions, setAssigneeOptions] = useState<Array<{ id: string; name: string }>>(MOCK_TECHNICIANS);
  const [costAllocations, setCostAllocations] = useState<AssetCostAllocation[]>([]);

  // Function to distribute cost equally among assets
  const handleDistributeEqually = () => {
    if (selectedAssets.length === 0 || !formData.actualCost || formData.actualCost <= 0) return;

    const costPerAsset = formData.actualCost / selectedAssets.length;
    const newAllocations: AssetCostAllocation[] = selectedAssets.map((assetId) => {
      const asset = MOCK_ASSETS.find((a) => a.id === assetId);
      return {
        assetId: assetId,
        assetCode: asset?.code || assetId,
        assetName: asset?.name || "Unknown Asset",
        allocatedCost: Number(costPerAsset.toFixed(2)),
      };
    });

    // Adjust the last asset to account for rounding differences
    const totalAllocated = newAllocations.reduce((sum, a) => sum + a.allocatedCost, 0);
    const difference = Number((formData.actualCost - totalAllocated).toFixed(2));
    if (difference !== 0 && newAllocations.length > 0) {
      newAllocations[newAllocations.length - 1].allocatedCost += difference;
      newAllocations[newAllocations.length - 1].allocatedCost = Number(
        newAllocations[newAllocations.length - 1].allocatedCost.toFixed(2)
      );
    }

    // Update both local state and form data
    setCostAllocations(newAllocations);
    setFormData((prev) => ({
      ...prev,
      actualCost: formData.actualCost, // Keep the actual cost as is
      costAllocations: newAllocations,
    }));
  };

  // Asset categories for SearchWithDropdown
  const assetCategories = [
    { id: "all", label: "All Categories" },
    { id: "heavy", label: "Heavy Equipment", sublabel: "Excavators, Bulldozers, Cranes" },
    { id: "power", label: "Power Equipment", sublabel: "Generators, Compressors" },
    { id: "material", label: "Material Handling", sublabel: "Forklifts" },
    { id: "tools", label: "Tools & Machinery", sublabel: "Welding Machines" },
  ];

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
        costAllocations: workOrder.costAllocations || [],
        notes: workOrder.notes || "",
        status: workOrder.status,
      });

      // Parse selected assets from workOrder
      const assetIds = workOrder.assetId.split(',').map(id => id.trim());
      setSelectedAssets(assetIds);

      // Set cost allocations if available
      if (workOrder.costAllocations && workOrder.costAllocations.length > 0) {
        setCostAllocations(workOrder.costAllocations);
      }
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

  // Clear cost allocations when assets change (for outsourced services)
  useEffect(() => {
    if (formData.serviceBy === "Outsourced" && selectedAssets.length > 0) {
      // Only clear if the number of assets changed, not on initial load
      if (costAllocations.length > 0 && costAllocations.length !== selectedAssets.length) {
        setCostAllocations([]);
        setFormData((prev) => ({
          ...prev,
          actualCost: 0,
        }));
      }
    }
  }, [selectedAssets.length, formData.serviceBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAssetSelectionChange = (assetIds: string[]) => {
    setSelectedAssets(assetIds);

    // Update form data
    if (assetIds.length === 0) {
      setFormData((prev) => ({
        ...prev,
        assetId: "",
        assetName: "",
      }));
    } else {
      const selectedAssetObjects = assetIds
        .map((id) => MOCK_ASSETS.find((a) => a.id === id))
        .filter((a) => a !== undefined);
      
      setFormData((prev) => ({
        ...prev,
        assetId: assetIds.join(","),
        assetName: selectedAssetObjects.map((a) => a!.name).join(", "),
      }));
    }
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

    // Validate cost allocations for outsourced services with actual cost
    if (formData.serviceBy === "Outsourced" && formData.actualCost && formData.actualCost > 0) {
      const totalAllocated = costAllocations.reduce((sum, a) => sum + a.allocatedCost, 0);
      const difference = Math.abs(formData.actualCost - totalAllocated);
      
      if (difference > 0.01) {
        alert(`Cost allocation mismatch: Total allocated (${totalAllocated.toFixed(2)}) must match actual cost (${formData.actualCost.toFixed(2)})`);
        return;
      }
    }

    // Include cost allocations in form data
    const submitData = {
      ...formData,
      costAllocations: formData.serviceBy === "Outsourced" && selectedAssets.length > 0
        ? costAllocations 
        : undefined,
    };

    onSubmit(submitData);
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
                    onSelectionChange={handleAssetSelectionChange}
                    placeholder="Search asset by name or ID..."
                    emptyMessage="No assets found"
                    disable={true}
                  />
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
                    <SelectDropdown
                      value={formData.type}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: value as MaintenanceType,
                        }))
                      }
                      options={MAINTENANCE_TYPES.map((type) => ({
                        value: type,
                        label: type,
                      }))}
                      placeholder="Select maintenance type"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="label-large block mb-2 text-onSurface">
                      Priority <span className="text-error">*</span>
                    </label>
                    <SelectDropdown
                      value={formData.priority}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          priority: value as MaintenancePriority,
                        }))
                      }
                      options={PRIORITY_LEVELS.map((priority) => ({
                        value: priority,
                        label: priority,
                      }))}
                      placeholder="Select priority"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="label-large block mb-2 text-onSurface">
                      Status <span className="text-error">*</span>
                    </label>
                    <SelectDropdown
                      value={formData.status}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: value as MaintenanceStatus,
                        }))
                      }
                      options={STATUS_OPTIONS.map((status) => ({
                        value: status,
                        label: status,
                      }))}
                      placeholder="Select status"
                      className="w-full"
                    />
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
                  <SelectDropdown
                    value={formData.serviceBy}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceBy: value as ServiceBy,
                        assignedTo: "", // Reset assignedTo when changing service type
                      }))
                    }
                    options={[
                      { value: "In-House", label: "In-House" },
                      { value: "Outsourced", label: "Outsourced" },
                    ]}
                    placeholder="Select service type"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Assigned To <span className="text-error">*</span>
                  </label>
                  <SelectDropdown
                    value={formData.assignedTo}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignedTo: value,
                      }))
                    }
                    options={[
                      {
                        value: "",
                        label: `-- Select ${formData.serviceBy === "In-House" ? "Technician" : "Vendor"} --`,
                        disabled: true,
                      },
                      ...assigneeOptions.map((option) => ({
                        value: option.name,
                        label: option.name,
                      })),
                    ]}
                    placeholder={`Select ${formData.serviceBy === "In-House" ? "Technician" : "Vendor"}`}
                    className="w-full"
                  />
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
                  <SemiDatePicker
                    inputType="dateTime"
                    value={formData.scheduledStartDateTime ? new Date(formData.scheduledStartDateTime) : undefined}
                    onChange={(date) => {
                      if (date instanceof Date) {
                        setFormData((prev) => ({
                          ...prev,
                          scheduledStartDateTime: date.toISOString().slice(0, 16),
                        }));
                      } else if (typeof date === "string") {
                        setFormData((prev) => ({
                          ...prev,
                          scheduledStartDateTime: new Date(date).toISOString().slice(0, 16),
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          scheduledStartDateTime: "",
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Scheduled End Date & Time{" "}
                    <span className="text-error">*</span>
                  </label>
                  <SemiDatePicker
                    inputType="dateTime"
                    value={formData.scheduledEndDateTime ? new Date(formData.scheduledEndDateTime) : undefined}
                    onChange={(date) => {
                      if (date instanceof Date) {
                        setFormData((prev) => ({
                          ...prev,
                          scheduledEndDateTime: date.toISOString().slice(0, 16),
                        }));
                      } else if (typeof date === "string") {
                        setFormData((prev) => ({
                          ...prev,
                          scheduledEndDateTime: new Date(date).toISOString().slice(0, 16),
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          scheduledEndDateTime: "",
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Actual Start Date & Time
                  </label>
                  <SemiDatePicker
                    inputType="dateTime"
                    value={formData.actualStartDateTime ? new Date(formData.actualStartDateTime) : undefined}
                    onChange={(date) => {
                      if (date instanceof Date) {
                        setFormData((prev) => ({
                          ...prev,
                          actualStartDateTime: date.toISOString().slice(0, 16),
                        }));
                      } else if (typeof date === "string") {
                        setFormData((prev) => ({
                          ...prev,
                          actualStartDateTime: new Date(date).toISOString().slice(0, 16),
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          actualStartDateTime: "",
                        }));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Actual End Date & Time
                  </label>
                  <SemiDatePicker
                    inputType="dateTime"
                    value={formData.actualEndDateTime ? new Date(formData.actualEndDateTime) : undefined}
                    onChange={(date) => {
                      if (date instanceof Date) {
                        setFormData((prev) => ({
                          ...prev,
                          actualEndDateTime: date.toISOString().slice(0, 16),
                        }));
                      } else if (typeof date === "string") {
                        setFormData((prev) => ({
                          ...prev,
                          actualEndDateTime: new Date(date).toISOString().slice(0, 16),
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          actualEndDateTime: "",
                        }));
                      }
                    }}
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
                  <div className="flex gap-2">
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
                      className="flex-1"
                    />
                    {formData.serviceBy === "Outsourced" && selectedAssets.length > 0 && (formData.actualCost ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={handleDistributeEqually}
                        className="px-4 py-2 bg-primary text-onPrimary rounded-lg hover:bg-primaryHover transition-colors label-large whitespace-nowrap"
                      >
                        Distribute Equally
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Cost Distribution for Outsourced Services */}
              {formData.serviceBy === "Outsourced" && selectedAssets.length > 0 && (
                <div className="mt-6">
                  <CostDistribution
                    assets={selectedAssets.map((assetId) => {
                      const asset = MOCK_ASSETS.find((a) => a.id === assetId);
                      return {
                        id: assetId,
                        code: asset?.code || assetId,
                        name: asset?.name || "Unknown Asset",
                      };
                    })}
                    totalCost={formData.actualCost || 0}
                    estimatedCost={formData.estimatedCost}
                    allocations={costAllocations}
                    onAllocationsChange={(allocations) => {
                      setCostAllocations(allocations);
                      // Calculate total from allocations and update actual cost
                      const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedCost, 0);
                      setFormData((prev) => ({
                        ...prev,
                        actualCost: totalAllocated,
                        costAllocations: allocations,
                      }));
                    }}
                  />
                </div>
              )}
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