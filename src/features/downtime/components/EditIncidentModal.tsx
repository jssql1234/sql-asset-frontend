import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { DowntimeIncident } from "@/features/downtime/types";
import type { EditDowntimeInput } from "@/features/downtime/zod/downtimeSchemas";
import { editDowntimeSchema } from "@/features/downtime/zod/downtimeSchemas";
import { useUpdateDowntimeIncident, useDeleteDowntimeIncident } from "@/features/downtime/hooks/useDowntimeService";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/features/downtime/constants";
import { Trash2 } from "lucide-react";
import { downtimeAssetGroups, downtimeAssets } from "@/features/downtime/mockData";

interface EditIncidentModalProps {
  open: boolean;
  incident: DowntimeIncident | null;
  onClose: () => void;
}

interface ReadOnlyFieldProps {
  label: string;
  valueClassName?: string;
  children: React.ReactNode;
}

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({ label, valueClassName, children }) => (
  <div className="rounded-lg border border-outlineVariant/60 bg-surfaceContainerLow px-3 py-2">
    <span className="label-small text-onSurfaceVariant">{label}</span>
    <div className={`mt-1 text-onSurface body-medium ${valueClassName ?? ""}`}>
      {children}
    </div>
  </div>
);

const DEFAULT_ASSET_CATEGORY = "all";

interface AssetDropdownItem {
  id: string;
  label: string;
  sublabel?: string;
  groupId: string;
  groupLabel: string;
}

export const EditIncidentModal: React.FC<EditIncidentModalProps> = ({
  open,
  incident,
  onClose,
}) => {
  const [formData, setFormData] = useState<EditDowntimeInput>({
    id: "",
    assetIds: [],
    priority: "Medium",
    status: "Down",
    description: "",
    startTime: new Date().toISOString(),
    endTime: undefined,
    resolutionNotes: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(DEFAULT_ASSET_CATEGORY);
  
  const updateMutation = useUpdateDowntimeIncident(() => {
    handleClose();
  });

  const deleteMutation = useDeleteDowntimeIncident(() => {
    handleClose();
  });

  // Update form data when incident changes
  useEffect(() => {
    if (incident && open) {
      setFormData({
        id: incident.id,
        assetIds: incident.assets.map((asset) => asset.id),
        priority: incident.priority,
        status: incident.status,
        description: incident.description,
        startTime: incident.startTime,
        endTime: incident.endTime,
        resolutionNotes: incident.resolutionNotes ?? "",
        reportedBy: incident.reportedBy,
        resolvedBy: incident.resolvedBy,
      });
      setErrors({});
      setIsEditMode(false);
      const initialCategory = incident.assets[0]?.groupId ?? DEFAULT_ASSET_CATEGORY;
      setSelectedCategoryId(initialCategory);
    }
  }, [incident, open]);

  const assetCategories = useMemo(
    () => [
      { id: DEFAULT_ASSET_CATEGORY, label: "All Assets" },
      ...downtimeAssetGroups.map((group) => ({
        id: group.id,
        label: group.label,
        sublabel: group.sublabel,
      })),
    ],
    []
  );

  const baseAssetItems = useMemo<AssetDropdownItem[]>(
    () =>
      downtimeAssets.map((asset) => ({
        id: asset.id,
        label: asset.name,
        sublabel: asset.location ?? asset.groupLabel,
        groupId: asset.groupId,
        groupLabel: asset.groupLabel,
      })),
    []
  );

  const baseAssetItemMap = useMemo(() => {
    const map = new Map<string, AssetDropdownItem>();
    baseAssetItems.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [baseAssetItems]);

  const assetItemMap = useMemo(() => {
    const map = new Map(baseAssetItemMap);
    incident?.assets.forEach((asset) => {
      map.set(asset.id, {
        id: asset.id,
        label: asset.name,
        sublabel: asset.location ?? asset.groupLabel,
        groupId: asset.groupId ?? DEFAULT_ASSET_CATEGORY,
        groupLabel: asset.groupLabel ?? "Other Assets",
      });
    });
    return map;
  }, [baseAssetItemMap, incident]);

  const assetItems = useMemo(() => {
    const baseItems =
      selectedCategoryId === DEFAULT_ASSET_CATEGORY
        ? baseAssetItems
        : baseAssetItems.filter((item) => item.groupId === selectedCategoryId);

    const itemMap = new Map<string, AssetDropdownItem>();
    baseItems.forEach((item) => {
      itemMap.set(item.id, item);
    });

    formData.assetIds.forEach((id) => {
      if (!itemMap.has(id)) {
        const match = assetItemMap.get(id);
        if (match) {
          itemMap.set(id, match);
        }
      }
    });

    return Array.from(itemMap.values());
  }, [selectedCategoryId, baseAssetItems, formData.assetIds, assetItemMap]);

  const selectedAssets = useMemo(
    () =>
      formData.assetIds.map((id) => {
        const match = assetItemMap.get(id);
        return {
          id,
          name: match?.label ?? id,
          groupLabel: match?.groupLabel,
        };
      }),
    [formData.assetIds, assetItemMap]
  );

  const handleAssetSelectionChange = (selectedIds: string[]) => {
    setFormData((prev) => ({ ...prev, assetIds: selectedIds }));
    setErrors((prev) => ({
      ...prev,
      assetIds: selectedIds.length === 0 ? "Select at least one asset" : "",
    }));
  };

  const handleClose = () => {
    setErrors({});
    setIsDeleteDialogOpen(false);
    setIsEditMode(false);
    setSelectedCategoryId(DEFAULT_ASSET_CATEGORY);
    onClose();
  };

  const handleDeleteClick = () => {
    if (!incident) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!incident) return;
    await deleteMutation.mutateAsync(incident.id);
    setIsDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = editDowntimeSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    // Clear errors and submit
    setErrors({});
    await updateMutation.mutateAsync(validation.data);
  };

  const handleInputChange = (field: keyof EditDowntimeInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handlePrioritySelect = (priority: EditDowntimeInput["priority"]) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleStatusSelect = (status: EditDowntimeInput["status"]) => {
    setFormData((prev) => {
      const nextEndTime = status === "Resolved"
        ? prev.endTime ?? new Date().toISOString()
        : undefined;

      return {
        ...prev,
        status,
        endTime: nextEndTime,
      };
    });
    setErrors((prev) => ({ ...prev, status: "", endTime: "", resolutionNotes: "" }));
  };

  const handleDateTimeChange = (field: "startTime" | "endTime") => (date: string | Date | Date[] | string[] | undefined | null) => {
    if (date === null || date === undefined || (Array.isArray(date) && date.length === 0)) {
      setFormData((prev) => ({ ...prev, [field]: field === "endTime" ? undefined : "" }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    if (date instanceof Date) {
      setFormData((prev) => ({ ...prev, [field]: date.toISOString() }));
    } else if (typeof date === "string") {
      setFormData((prev) => ({ ...prev, [field]: date }));
    }
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!incident) return null;

  const incidentAssetSummary = incident.assets
    .map((asset) => `${asset.name} (${asset.id})`)
    .join(", ");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Incident" : "Incident Details"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          {/* Assets */}
          <div className="flex flex-col gap-2">
            {isEditMode ? (
              <>
                <label className="label-medium text-onSurface">Assets*</label>
                <SearchWithDropdown
                  categories={assetCategories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={setSelectedCategoryId}
                  items={assetItems}
                  selectedIds={formData.assetIds}
                  onSelectionChange={handleAssetSelectionChange}
                  placeholder="Search assets..."
                  emptyMessage="No assets found"
                  className="w-full"
                  hideSelectedField={formData.assetIds.length === 0}
                />
                {errors.assetIds && (
                  <span className="text-sm text-error">{errors.assetIds}</span>
                )}
              </>
            ) : (
              <ReadOnlyField label="Assets">
                {selectedAssets.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAssets.map((asset) => (
                      <span
                        key={asset.id}
                        className="rounded-full bg-surfaceContainerHighest px-3 py-1 text-xs text-onSurfaceVariant"
                      >
                        {asset.name} ({asset.id})
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-onSurfaceVariant">—</span>
                )}
              </ReadOnlyField>
            )}
          </div>

          {/* Priority Selection */}
          <div className="flex flex-col gap-2">
            {isEditMode ? (
              <>
                <label className="label-medium text-onSurface">Priority*</label>
              <DropdownMenu className="w-full">
                <DropdownMenuTrigger label={formData.priority} className="w-full justify-between" />
                <DropdownMenuContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => {
                        handlePrioritySelect(option.value);
                      }}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : (
              <ReadOnlyField label="Priority*">{formData.priority}</ReadOnlyField>
            )}
          </div>

          {/* Status Selection */}
          <div className="flex flex-col gap-2">
            {isEditMode ? (
              <>
                <label className="label-medium text-onSurface">Status*</label>
                <DropdownMenu className="w-full">
                  <DropdownMenuTrigger label={formData.status} className="w-full justify-between" />
                  <DropdownMenuContent>
                    {STATUS_OPTIONS.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => {
                          handleStatusSelect(option.value);
                        }}
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <ReadOnlyField label="Status*">{formData.status}</ReadOnlyField>
            )}
          </div>

          {/* Start Time */}
          <div className="flex flex-col gap-2">
            {isEditMode ? (
              <>
                <label className="label-medium text-onSurface">Start Time*</label>
                <SemiDatePicker
                  value={formData.startTime ? new Date(formData.startTime) : null}
                  onChange={handleDateTimeChange("startTime")}
                  inputType="dateTime"
                  className="w-full"
                />
                {errors.startTime && (
                  <span className="text-sm text-error">{errors.startTime}</span>
                )}
              </>
            ) : (
              <ReadOnlyField label="Start Time*">
                {new Date(formData.startTime).toLocaleString()}
              </ReadOnlyField>
            )}
          </div>

          {/* End Time (show if resolved) */}
          {formData.status === "Resolved" && (
            <div className="flex flex-col gap-2">
              {isEditMode ? (
                <>
                  <label className="label-medium text-onSurface">End Time*</label>
                  <SemiDatePicker
                    value={formData.endTime ? new Date(formData.endTime) : null}
                    onChange={handleDateTimeChange("endTime")}
                    inputType="dateTime"
                    className="w-full"
                  />
                  {errors.endTime && (
                    <span className="text-sm text-error">{errors.endTime}</span>
                  )}
                </>
              ) : (
                <ReadOnlyField label="End Time*">
                  {formData.endTime ? new Date(formData.endTime).toLocaleString() : "—"}
                </ReadOnlyField>
              )}
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-2">
            {isEditMode ? (
              <>
                <label className="label-medium text-onSurface">Description*</label>
                <TextArea
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  placeholder="Describe the issue... (minimum 10 characters)"
                  className="min-h-[100px]"
                />
                {errors.description && (
                  <span className="text-sm text-error">{errors.description}</span>
                )}
              </>
            ) : (
              <ReadOnlyField label="Description*" valueClassName="whitespace-pre-wrap">
                {formData.description}
              </ReadOnlyField>
            )}
          </div>

          {/* Resolution Notes (show if resolved) */}
          {formData.status === "Resolved" && (
            <div className="flex flex-col gap-2">
              {isEditMode ? (
                <>
                  <label className="label-medium text-onSurface">Resolution Notes*</label>
                  <TextArea
                    value={formData.resolutionNotes ?? ""}
                    onChange={handleInputChange("resolutionNotes")}
                    placeholder="Describe how the issue was resolved... (minimum 10 characters)"
                    className="min-h-[80px]"
                  />
                  {errors.resolutionNotes && (
                    <span className="text-sm text-error">{errors.resolutionNotes}</span>
                  )}
                </>
              ) : (
                <ReadOnlyField label="Resolution Notes*" valueClassName="whitespace-pre-wrap">
                  {formData.resolutionNotes ?? "—"}
                </ReadOnlyField>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            {isEditMode ? (
              <>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" onClick={() => { setIsEditMode(false); }}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    type="submit"
                  >
                    Update Incident
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex gap-2 w-full justify-between">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handleDeleteClick}
                  className="text-error hover:text-error hover:bg-errorContainer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Close
                  </Button>
                  <Button
                    variant="default"
                    type="button"
                    onClick={() => { setIsEditMode(true); }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            setIsDeleteDialogOpen(true);
          } else {
            handleCancelDelete();
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-error">
              Delete incident?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-onSurfaceVariant text-sm">
              This will permanently remove the downtime incident for
              {" "}
              <span className="font-medium text-onSurface">
                {incidentAssetSummary || "selected assets"}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex items-start gap-3 rounded-lg border border-error bg-errorContainer/40 p-3">
              <Trash2 className="h-5 w-5 text-error mt-0.5" />
              <div className="text-sm text-error">
                Please confirm you want to proceed.
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancelDelete}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={() => void handleConfirmDelete()}
            >
              Delete Incident
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};