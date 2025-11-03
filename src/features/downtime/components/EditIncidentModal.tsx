import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import type { DowntimeIncident } from "@/features/downtime/types";
import type { EditDowntimeInput } from "@/features/downtime/zod/downtimeSchemas";
import { editDowntimeSchema } from "@/features/downtime/zod/downtimeSchemas";
import { useUpdateDowntimeIncident, useDeleteDowntimeIncident } from "@/features/downtime/hooks/useDowntimeService";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/features/downtime/constants";
import { DEFAULT_ASSET_CATEGORY, useAssetCategories, useAssetItems, useFormErrors, useDateTimeChange, useAssetSelectionHandler, usePriorityHandler, useInputChangeHandler } from "@/features/downtime/hooks/useDowntimeForm";

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

export function EditIncidentModal({ open, incident, onClose }: EditIncidentModalProps) {
  const [formData, setFormData] = useState<EditDowntimeInput>(() => getDefaultFormData());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(DEFAULT_ASSET_CATEGORY);

  const { errors, setFieldErrors, clearErrors } = useFormErrors();
  const { assetCategories, allAssetItemsMap } = useAssetCategories(incident);
  const assetItems = useAssetItems(allAssetItemsMap, formData.assetIds);
  const handleDateTimeChange = useDateTimeChange(setFormData, (field) => {
    clearErrors(field);
  });
  const handleAssetSelectionChange = useAssetSelectionHandler(setFormData, clearErrors);
  const handlePrioritySelect = usePriorityHandler(setFormData);
  const handleInputChange = useInputChangeHandler(setFormData, clearErrors);

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
    setFieldErrors({});
    setIsDeleteDialogOpen(false);
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
      setSelectedCategoryId(incident.assets[0]?.groupId ?? DEFAULT_ASSET_CATEGORY);
    }
  }, [incident, open, setFieldErrors]);

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
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

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

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { 
      if (!isOpen) handleClose(); 
    }}>
      <DialogContent className="w-[600px] max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Edit Incident</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <form onSubmit={(e) => { void handleSubmit(e); }} className="flex flex-col gap-4 pr-1">
            {/* Assets */}
            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">Assets<span className="text-error">*</span></label>
              <SearchWithDropdown
                categories={assetCategories} selectedCategoryId={selectedCategoryId} onCategoryChange={setSelectedCategoryId}
                items={assetItems} selectedIds={formData.assetIds} onSelectionChange={handleAssetSelectionChange}
                placeholder="Search assets..." emptyMessage="No assets found" className="w-full"
                hideSelectedField={formData.assetIds.length === 0}
              />
              {errors.assetIds && (
                <span className="text-sm text-error">{errors.assetIds}</span>
              )}
            </div>

            {/* Priority and Status Selection */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority Selection */}
              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">Priority<span className="text-error">*</span></label>
                <DropdownMenu className="w-full">
                  <DropdownMenuTrigger label={formData.priority} className="w-full justify-between" />
                  <DropdownMenuContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <DropdownMenuItem key={option.value} onClick={() => { handlePrioritySelect(option.value); }}>{option.label}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status Selection */}
              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">Status<span className="text-error">*</span></label>
                <DropdownMenu className="w-full">
                  <DropdownMenuTrigger label={formData.status} className="w-full justify-between" />
                  <DropdownMenuContent>
                    {STATUS_OPTIONS.map((option) => (
                      <DropdownMenuItem key={option.value} onClick={() => { handleStatusSelect(option.value); }}>{option.label}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Start Time and End Time (end time shows when resolved) */}
            <div className={`grid gap-4 ${formData.status === "Resolved" ? "grid-cols-2" : "grid-cols-1"}`}>
              {/* Start Time */}
              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">Start Time<span className="text-error">*</span></label>
                <SemiDatePicker
                  value={formData.startTime ? new Date(formData.startTime) : null} onChange={handleDateTimeChange("startTime")}
                  inputType="dateTime" className="w-full"
                />
                {errors.startTime && (
                  <span className="text-sm text-error">{errors.startTime}</span>
                )}
              </div>

              {/* End Time (show if resolved) */}
              {formData.status === "Resolved" && (
                <div className="flex flex-col gap-2">
                  <label className="label-medium text-onSurface">End Time<span className="text-error">*</span></label>
                  <SemiDatePicker
                    value={formData.endTime ? new Date(formData.endTime) : null} onChange={handleDateTimeChange("endTime")}
                    inputType="dateTime" className="w-full"
                  />
                  {errors.endTime && (
                    <span className="text-sm text-error">{errors.endTime}</span>
                  )}
                </div>
              )}
            </div>

            {/* Description or Resolution Notes (mutually exclusive based on status) */}
            {formData.status !== "Resolved" ? (
              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">Description<span className="text-error">*</span></label>
                <TextArea
                  value={formData.description} onChange={handleInputChange("description")}
                  placeholder="Describe the issue... (minimum 10 characters)" className="min-h-[90px]"
                />
                {errors.description && (
                  <span className="text-sm text-error">{errors.description}</span>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">Resolution Notes<span className="text-error">*</span></label>
                <TextArea
                  value={formData.resolutionNotes ?? ""} onChange={handleInputChange("resolutionNotes")}
                  placeholder="Describe how the issue was resolved..." className="min-h-[90px]"
                />
                {errors.resolutionNotes && (
                  <span className="text-sm text-error">{errors.resolutionNotes}</span>
                )}
              </div>
            )}
          </form>
        </div>
          
        <DialogFooter className="flex-shrink-0 flex justify-between items-center">
          <Button variant="default" type="submit" onClick={() => { void handleSubmit(); }}>Update Incident</Button>
        </DialogFooter>
      </DialogContent>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen} onClose={handleCancelDelete} onConfirm={() => { void handleConfirmDelete(); }}
        title="Delete incident?" description="This will permanently remove the downtime incident for the following assets. This action cannot be undone."
        confirmButtonText="Delete Incident" itemIds={incident.assets.map((asset) => asset.id)}
        itemNames={incident.assets.map((asset) => `${asset.name} (${asset.id})`)}
        itemCount={incident.assets.length}
      />
    </Dialog>
  );
}