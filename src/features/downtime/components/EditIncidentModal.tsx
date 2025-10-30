import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { DowntimeIncident } from "@/features/downtime/types";
import type { EditDowntimeInput } from "@/features/downtime/zod/downtimeSchemas";
import { editDowntimeSchema } from "@/features/downtime/zod/downtimeSchemas";
import {
  useUpdateDowntimeIncident,
  useDeleteDowntimeIncident,
} from "@/features/downtime/hooks/useDowntimeService";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/features/downtime/constants";
import { Trash2 } from "lucide-react";
import { ReadOnlyField } from "./ReadOnlyField";
import {
  DEFAULT_ASSET_CATEGORY,
  useAssetCategories,
  useFilteredAssetItems,
  useFormErrors,
  useDateTimeChange,
} from "@/features/downtime/hooks/useDowntimeForm";

interface EditIncidentModalProps {
  open: boolean;
  incident: DowntimeIncident | null;
  onClose: () => void;
}

const getDefaultFormData = (): EditDowntimeInput => ({
  id: "",
  assetIds: [],
  priority: "Low",
  status: "Down",
  description: "",
  startTime: new Date().toISOString(),
  endTime: undefined,
  resolutionNotes: "",
});

export const EditIncidentModal: React.FC<EditIncidentModalProps> = ({
  open,
  incident,
  onClose,
}) => {
  const [formData, setFormData] = useState<EditDowntimeInput>(getDefaultFormData);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(DEFAULT_ASSET_CATEGORY);

  const { errors, setFieldErrors, clearErrors } = useFormErrors();
  const { assetCategories, allAssetItemsMap } = useAssetCategories(incident);
  const assetItems = useFilteredAssetItems(selectedCategoryId, allAssetItemsMap, formData.assetIds);
  const handleDateTimeChange = useDateTimeChange(setFormData, (field) => {
    clearErrors(field);
  });

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
    setFieldErrors({});
    setIsDeleteDialogOpen(false);
    setIsEditMode(false);
    setSelectedCategoryId(DEFAULT_ASSET_CATEGORY);
  }, [setFieldErrors]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const updateMutation = useUpdateDowntimeIncident(handleClose);
  const deleteMutation = useDeleteDowntimeIncident(handleClose);

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
      setFieldErrors({});
      setIsEditMode(false);
      setSelectedCategoryId(incident.assets[0]?.groupId ?? DEFAULT_ASSET_CATEGORY);
    }
  }, [incident, open, setFieldErrors]);

  const selectedAssets = useMemo(
    () =>
      formData.assetIds.map((id) => {
        const match = allAssetItemsMap.get(id);
        return {
          id,
          name: match?.label ?? id,
          groupLabel: match?.groupLabel,
        };
      }),
    [formData.assetIds, allAssetItemsMap]
  );

  const handleAssetSelectionChange = useCallback(
    (selectedIds: string[]) => {
      setFormData((prev) => ({ ...prev, assetIds: selectedIds }));
      clearErrors(selectedIds.length === 0 ? "" : "assetIds");
    },
    [clearErrors]
  );

  const handleDeleteClick = useCallback(() => {
    if (incident) setIsDeleteDialogOpen(true);
  }, [incident]);

  const handleConfirmDelete = useCallback(async () => {
    if (incident) {
      await deleteMutation.mutateAsync(incident.id);
      setIsDeleteDialogOpen(false);
    }
  }, [incident, deleteMutation]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const validation = editDowntimeSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          fieldErrors[issue.path.join(".")] = issue.message;
        });
        setFieldErrors(fieldErrors);
        return;
      }

      setFieldErrors({});
      await updateMutation.mutateAsync(validation.data);
    },
    [formData, updateMutation, setFieldErrors]
  );

  const handleInputChange = useCallback(
    (field: keyof EditDowntimeInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      clearErrors(field);
    },
    [clearErrors]
  );

  const handlePrioritySelect = useCallback((priority: EditDowntimeInput["priority"]) => {
    setFormData((prev) => ({ ...prev, priority }));
  }, []);

  const handleStatusSelect = useCallback(
    (status: EditDowntimeInput["status"]) => {
      setFormData((prev) => ({
        ...prev,
        status,
        endTime: status === "Resolved" ? prev.endTime ?? new Date().toISOString() : undefined,
        resolutionNotes: status !== "Resolved" ? "" : prev.resolutionNotes,
      }));
      clearErrors("status", "endTime", "resolutionNotes");
    },
    [clearErrors]
  );

  const toggleEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const toggleCancelEdit = useCallback(() => {
    setIsEditMode(false);
  }, []);

  if (!incident) return null;

  const incidentAssetSummary = incident.assets
    .map((asset) => `${asset.name} (${asset.id})`)
    .join(", ");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { 
      if (!isOpen) handleClose(); 
    }}>
      <DialogContent className="w-[600px] max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditMode ? "Edit Incident" : "Incident Details"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-4 pr-1">
            {/* Assets */}
            <div className="flex flex-col gap-2">
              {isEditMode ? (
                <>
                  <label className="label-medium text-onSurface">Assets<span className="text-error">*</span></label>
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
                    <div className="max-h-70 overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {selectedAssets.map((asset) => (
                          <div
                            key={asset.id}
                            className="flex flex-col gap-1 rounded-md border border-outlineVariant/60 bg-surfaceContainerHighest px-3 py-2"
                          >
                            <span className="body-small text-onSurface">{asset.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-onSurfaceVariant">—</span>
                  )}
                </ReadOnlyField>
              )}
            </div>

            {/* Priority and Status Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority Selection */}
              <div className="flex flex-col gap-2">
                {isEditMode ? (
                  <>
                    <label className="label-medium text-onSurface">Priority<span className="text-error">*</span></label>
                    <DropdownMenu className="w-full">
                      <DropdownMenuTrigger label={formData.priority} className="w-full justify-between" />
                      <DropdownMenuContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <DropdownMenuItem key={option.value} onClick={() => { handlePrioritySelect(option.value); }}>
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <ReadOnlyField label="Priority">{formData.priority}</ReadOnlyField>
                )}
              </div>

              {/* Status Selection */}
              <div className="flex flex-col gap-2">
                {isEditMode ? (
                  <>
                    <label className="label-medium text-onSurface">Status<span className="text-error">*</span></label>
                    <DropdownMenu className="w-full">
                      <DropdownMenuTrigger label={formData.status} className="w-full justify-between" />
                      <DropdownMenuContent>
                        {STATUS_OPTIONS.map((option) => (
                          <DropdownMenuItem key={option.value} onClick={() => { handleStatusSelect(option.value); }}>
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <ReadOnlyField label="Status">{formData.status}</ReadOnlyField>
                )}
              </div>
            </div>

            {/* Start Time and End Time (end time shows when resolved) */}
            <div className={`grid gap-4 ${formData.status === "Resolved" ? "grid-cols-2" : "grid-cols-1"}`}>
              {/* Start Time */}
              <div className="flex flex-col gap-2">
                {isEditMode ? (
                  <>
                    <label className="label-medium text-onSurface">Start Time<span className="text-error">*</span></label>
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
                  <ReadOnlyField label="Start Time">
                    {new Date(formData.startTime).toLocaleString()}
                  </ReadOnlyField>
                )}
              </div>

              {/* End Time (show if resolved) */}
              {formData.status === "Resolved" && (
                <div className="flex flex-col gap-2">
                  {isEditMode ? (
                    <>
                      <label className="label-medium text-onSurface">End Time<span className="text-error">*</span></label>
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
                    <ReadOnlyField label="End Time">
                      {formData.endTime ? new Date(formData.endTime).toLocaleString() : "—"}
                    </ReadOnlyField>
                  )}
                </div>
              )}
            </div>

            {/* Description or Resolution Notes (mutually exclusive based on status) */}
            {formData.status !== "Resolved" ? (
              <div className="flex flex-col gap-2">
                {isEditMode ? (
                  <>
                    <label className="label-medium text-onSurface">Description<span className="text-error">*</span></label>
                    <TextArea
                      value={formData.description}
                      onChange={handleInputChange("description")}
                      placeholder="Describe the issue... (minimum 10 characters)"
                      className="min-h-[90px]"
                    />
                    {errors.description && (
                      <span className="text-sm text-error">{errors.description}</span>
                    )}
                  </>
                ) : (
                  <ReadOnlyField label="Description" valueClassName="whitespace-pre-wrap">
                    {formData.description}
                  </ReadOnlyField>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {isEditMode ? (
                  <>
                    <label className="label-medium text-onSurface">Resolution Notes<span className="text-error">*</span></label>
                    <TextArea
                      value={formData.resolutionNotes ?? ""}
                      onChange={handleInputChange("resolutionNotes")}
                      placeholder="Describe how the issue was resolved..."
                      className="min-h-[90px]"
                    />
                    {errors.resolutionNotes && (
                      <span className="text-sm text-error">{errors.resolutionNotes}</span>
                    )}
                  </>
                ) : (
                  <ReadOnlyField label={<>Resolution Notes<span className="text-error">*</span></>} valueClassName="whitespace-pre-wrap">
                    {formData.resolutionNotes ?? "—"}
                  </ReadOnlyField>
                )}
              </div>
            )}
          </form>
        </div>
          
        <DialogFooter className="flex-shrink-0 flex justify-between items-center">
          {isEditMode ? (
            <>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={toggleCancelEdit}>Cancel</Button>
                <Button variant="default" type="submit" onClick={() => { void handleSubmit(); }}>Update Incident</Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost"type="button" onClick={handleDeleteClick} className="text-error hover:text-error hover:bg-errorContainer">
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </Button>
              <Button variant="default" type="button" onClick={toggleEditMode}>Edit</Button>              
            </div>
          )}
        </DialogFooter>
      </DialogContent>
      <Dialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => {
        if (isOpen) {
          setIsDeleteDialogOpen(true);
        } else {
          handleCancelDelete();
        }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-error">Delete incident?</DialogTitle>
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
              <div className="text-sm text-error">Please confirm you want to proceed.</div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={handleCancelDelete}>Cancel</Button>
            <Button variant="destructive" type="button" onClick={() => { void handleConfirmDelete(); }}>Delete Incident</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};