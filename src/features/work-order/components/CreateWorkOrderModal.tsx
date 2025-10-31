import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import SelectDropdown from "@/components/SelectDropdown";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { useToast } from "@/components/ui/components/Toast/useToast";
import type {
  WorkOrderFormData,
  MaintenanceType,
  MaintenanceStatus,
  ServiceBy,
  AssetCostAllocation,
} from "../types";
import {
  MOCK_ASSETS,
  MOCK_TECHNICIANS,
  MOCK_VENDORS,
  MAINTENANCE_TYPES,
  STATUS_OPTIONS,
} from "../mockData";
import { CostDistribution } from "./CostDistribution";

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkOrderFormData) => void;
  prefilledDates?: {
    scheduledDate?: string;
    scheduledStartDateTime?: string;
    scheduledEndDateTime?: string;
  };
  prefilledData?: {
    assetIds?: string[];
    jobTitle?: string;
    description?: string;
  };
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  prefilledDates,
  prefilledData,
}) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<WorkOrderFormData>({
    assetId: "",
    assetName: "",
    jobTitle: "",
    description: "",
    type: "Preventive",
    scheduledDate: prefilledDates?.scheduledDate || "",
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
  const [assigneeOptions, setAssigneeOptions] =
    useState<Array<{ id: string; name: string }>>(MOCK_TECHNICIANS);
  const [costAllocations, setCostAllocations] = useState<AssetCostAllocation[]>([]);
  
  // Validation error states
  const [errors, setErrors] = useState<{
    assets?: boolean;
    jobTitle?: boolean;
    scheduledStartDateTime?: boolean;
    scheduledEndDateTime?: boolean;
    scheduledEndBeforeStart?: boolean;
    actualEndDateTime?: boolean;
    actualEndBeforeStart?: boolean;
    costAllocation?: boolean;
    assignedTo?: boolean;
  }>({});

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
    { id: "heavy", label: "Heavy Equipment", sublabel: "qty: 2" },
    { id: "power", label: "Power Equipment", sublabel: "Generators, Compressors" },
    { id: "material", label: "Material Handling", sublabel: "Forklifts" },
    { id: "tools", label: "Tools & Machinery", sublabel: "Welding Machines" },
  ];

  // Update scheduled dates if prefilledDates changes
  useEffect(() => {
    if (
      prefilledDates?.scheduledDate ||
      prefilledDates?.scheduledStartDateTime ||
      prefilledDates?.scheduledEndDateTime
    ) {
      setFormData((prev) => ({
        ...prev,
        scheduledDate: prefilledDates.scheduledDate || prev.scheduledDate,
        scheduledStartDateTime:
          prefilledDates.scheduledStartDateTime || prev.scheduledStartDateTime,
        scheduledEndDateTime:
          prefilledDates.scheduledEndDateTime || prev.scheduledEndDateTime,
      }));
    }
  }, [prefilledDates]);

  // Update form data if prefilledData changes
  useEffect(() => {
    if (isOpen && prefilledData) {
      if (prefilledData.assetIds && prefilledData.assetIds.length > 0) {
        setSelectedAssets(prefilledData.assetIds);
        
        const selectedAssetObjects = prefilledData.assetIds
          .map((id) => MOCK_ASSETS.find((a) => a.id === id || a.code === id))
          .filter((a) => a !== undefined);
        
        setFormData((prev) => ({
          ...prev,
          assetId: prefilledData.assetIds!.join(","),
          assetName: selectedAssetObjects.map((a) => a!.name).join(", "),
          jobTitle: prefilledData.jobTitle || prev.jobTitle,
          notes: prefilledData.description || prev.description,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          jobTitle: prefilledData.jobTitle || prev.jobTitle,
          notes: prefilledData.description || prev.description,
        }));
      }
    }
  }, [isOpen, prefilledData]);

  // Update assignee options based on service type
  useEffect(() => {
    if (formData.serviceBy === "In-House") {
      setAssigneeOptions(MOCK_TECHNICIANS);
      setFormData((prev) => ({ ...prev, assignedTo: "" }));
    } else if (formData.serviceBy === "Outsourced") {
      setAssigneeOptions(MOCK_VENDORS);
      setFormData((prev) => ({ ...prev, assignedTo: "" }));
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

    // Clear asset error if assets are selected
    if (assetIds.length > 0 && errors.assets) {
      setErrors((prev) => ({ ...prev, assets: false }));
    }

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

    // Reset errors
    const newErrors: typeof errors = {};

    // Validation
    if (selectedAssets.length === 0) {
      newErrors.assets = true;
    }
    
    if (!formData.jobTitle) {
      newErrors.jobTitle = true;
    }
    
    if (!formData.scheduledStartDateTime) {
      newErrors.scheduledStartDateTime = true;
    }
    
    if (!formData.scheduledEndDateTime) {
      newErrors.scheduledEndDateTime = true;
    }

    if (formData.assignedTo === "") { 
      newErrors.assignedTo = true;
    }

    // Validate that scheduled end is after scheduled start
    if (
      formData.scheduledEndDateTime &&
      formData.scheduledStartDateTime &&
      new Date(formData.scheduledEndDateTime) <=
        new Date(formData.scheduledStartDateTime)
    ) {
      newErrors.scheduledEndBeforeStart = true;
      newErrors.scheduledEndDateTime = true;
    }

    // Validate actual dates if provided
    if (
      formData.actualEndDateTime &&
      formData.actualStartDateTime &&
      new Date(formData.actualEndDateTime) <=
        new Date(formData.actualStartDateTime)
    ) {
      newErrors.actualEndBeforeStart = true;
      newErrors.actualEndDateTime = true;
    }

    // If status is completed, require actual end datetime
    if (formData.status === "Completed" && !formData.actualEndDateTime) {
      newErrors.actualEndDateTime = true;
    }

    // Validate cost allocations for outsourced services with actual cost
    if (formData.serviceBy === "Outsourced" && formData.actualCost && formData.actualCost > 0) {
      const totalAllocated = costAllocations.reduce((sum, a) => sum + a.allocatedCost, 0);
      const difference = Math.abs(formData.actualCost - totalAllocated);
      
      if (difference > 0.01) {
        newErrors.costAllocation = true;
      }
    }

    // If there are errors, update state and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Include cost allocations in form data
    const submitData = {
      ...formData,
      costAllocations: formData.serviceBy === "Outsourced" && selectedAssets.length > 0
        ? costAllocations 
        : undefined,
    };

    onSubmit(submitData);
    
    // Show success toast
    addToast({
      title: "Work Order Created",
      description: "Work order has been created successfully.",
      variant: "success",
      duration: 3000,
    });
    
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      assetId: "",
      assetName: "",
      jobTitle: "",
      description: "",
      type: "Preventive",
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
    setSelectedAssets([]);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[800px] max-w-[90vw] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outlineVariant">
          <h2 className="headline-small font-semibold text-onSurface">
            Create Work Order
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
                  />
                  {errors.assets && (
                    <p className="text-error body-small mt-1">
                      Please select at least one asset
                    </p>
                  )}
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
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        jobTitle: e.target.value,
                      }));
                      if (errors.jobTitle) {
                        setErrors((prev) => ({ ...prev, jobTitle: false }));
                      }
                    }}
                    placeholder="Brief description of the work"
                    className={`w-full ${errors.jobTitle ? "border-error focus:border-error" : ""}`}
                  />
                  {errors.jobTitle && (
                    <p className="text-error body-small mt-1">
                      Job title is required
                    </p>
                  )}
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
                <div className="grid grid-cols-2 gap-4">
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
                    onChange={(value) => {
                      setFormData((prev) => ({
                        ...prev,
                        assignedTo: value,
                      }));
                      if (errors.assignedTo && value !== "") {
                        setErrors((prev) => ({ ...prev, assignedTo: false }));
                      }
                    }}
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
                    buttonClassName={errors.assignedTo ? "border-error" : ""}
                  />
                  {errors.assignedTo && (
                    <p className="text-error body-small mt-1">
                      Please select {formData.serviceBy === "In-House" ? "a technician" : "a vendor"}
                    </p>
                  )}
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
                  <div className={errors.scheduledStartDateTime ? "[&_.semi-input-wrapper]:border-error [&_.semi-input-wrapper]:focus-within:border-error" : ""}>
                    <SemiDatePicker
                      inputType="dateTime"
                      value={formData.scheduledStartDateTime ? new Date(formData.scheduledStartDateTime) : undefined}
                      onChange={(date) => {
                        if (date instanceof Date) {
                          // Format date to local datetime string (YYYY-MM-DDTHH:mm)
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                          
                          setFormData((prev) => ({
                            ...prev,
                            scheduledStartDateTime: formattedDate,
                          }));
                        } else if (typeof date === "string") {
                          setFormData((prev) => ({
                            ...prev,
                            scheduledStartDateTime: date.slice(0, 16),
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            scheduledStartDateTime: "",
                          }));
                        }
                        if (errors.scheduledStartDateTime) {
                          setErrors((prev) => ({ ...prev, scheduledStartDateTime: false }));
                        }
                      }}
                    />
                  </div>
                  {errors.scheduledStartDateTime && (
                    <p className="text-error body-small mt-1">
                      Scheduled start date & time is required
                    </p>
                  )}
                </div>
                <div>
                  <label className="label-large block mb-2 text-onSurface">
                    Scheduled End Date & Time{" "}
                    <span className="text-error">*</span>
                  </label>
                  <div className={errors.scheduledEndDateTime ? "[&_.semi-input-wrapper]:border-error [&_.semi-input-wrapper]:focus-within:border-error" : ""}>
                    <SemiDatePicker
                      inputType="dateTime"
                      value={formData.scheduledEndDateTime ? new Date(formData.scheduledEndDateTime) : undefined}
                      onChange={(date) => {
                        if (date instanceof Date) {
                          // Format date to local datetime string (YYYY-MM-DDTHH:mm)
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                          
                          setFormData((prev) => ({
                            ...prev,
                            scheduledEndDateTime: formattedDate,
                          }));
                        } else if (typeof date === "string") {
                          setFormData((prev) => ({
                            ...prev,
                            scheduledEndDateTime: date.slice(0, 16),
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            scheduledEndDateTime: "",
                          }));
                        }
                        if (errors.scheduledEndDateTime || errors.scheduledEndBeforeStart) {
                          setErrors((prev) => ({ 
                            ...prev, 
                            scheduledEndDateTime: false,
                            scheduledEndBeforeStart: false
                          }));
                        }
                      }}
                    />
                  </div>
                  {errors.scheduledEndDateTime && !errors.scheduledEndBeforeStart && (
                    <p className="text-error body-small mt-1">
                      Scheduled end date & time is required
                    </p>
                  )}
                  {errors.scheduledEndBeforeStart && (
                    <p className="text-error body-small mt-1">
                      End date & time must be after start date & time
                    </p>
                  )}
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
                        // Format date to local datetime string (YYYY-MM-DDTHH:mm)
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                        
                        setFormData((prev) => ({
                          ...prev,
                          actualStartDateTime: formattedDate,
                        }));
                      } else if (typeof date === "string") {
                        setFormData((prev) => ({
                          ...prev,
                          actualStartDateTime: date.slice(0, 16),
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
                  <div className={errors.actualEndDateTime ? "[&_.semi-input-wrapper]:border-error [&_.semi-input-wrapper]:focus-within:border-error" : ""}>
                    <SemiDatePicker
                      inputType="dateTime"
                      value={formData.actualEndDateTime ? new Date(formData.actualEndDateTime) : undefined}
                      onChange={(date) => {
                        if (date instanceof Date) {
                          // Format date to local datetime string (YYYY-MM-DDTHH:mm)
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          const hours = String(date.getHours()).padStart(2, '0');
                          const minutes = String(date.getMinutes()).padStart(2, '0');
                          const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
                          
                          setFormData((prev) => ({
                            ...prev,
                            actualEndDateTime: formattedDate,
                          }));
                        } else if (typeof date === "string") {
                          setFormData((prev) => ({
                            ...prev,
                            actualEndDateTime: date.slice(0, 16),
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            actualEndDateTime: "",
                          }));
                        }
                        if (errors.actualEndDateTime || errors.actualEndBeforeStart) {
                          setErrors((prev) => ({ 
                            ...prev, 
                            actualEndDateTime: false,
                            actualEndBeforeStart: false
                          }));
                        }
                      }}
                    />
                  </div>
                  <p className="body-small text-onSurfaceVariant mt-1">
                    Required for completed status
                  </p>
                  {errors.actualEndDateTime && !errors.actualEndBeforeStart && formData.status === "Completed" && (
                    <p className="text-error body-small mt-1">
                      Actual end date & time is required for completed work orders
                    </p>
                  )}
                  {errors.actualEndBeforeStart && (
                    <p className="text-error body-small mt-1">
                      Actual end date & time must be after actual start date & time
                    </p>
                  )}
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
                      if (errors.costAllocation) {
                        setErrors((prev) => ({ ...prev, costAllocation: false }));
                      }
                    }}
                  />
                  {errors.costAllocation && (
                    <p className="text-error body-small mt-2">
                      Cost allocation mismatch: Total allocated cost must match actual cost
                    </p>
                  )}
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
              Create Work Order
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkOrderModal;
