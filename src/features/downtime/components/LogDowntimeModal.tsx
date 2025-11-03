import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { CreateDowntimeInput } from "@/features/downtime/zod/downtimeSchemas";
import { createDowntimeSchema } from "@/features/downtime/zod/downtimeSchemas";
import { useCreateDowntimeIncident } from "@/features/downtime/hooks/useDowntimeService";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/features/downtime/constants";
import { DEFAULT_ASSET_CATEGORY, useAssetCategories, useAssetItems, useFormErrors, useDateTimeChange, useAssetSelectionHandler, usePriorityHandler, useInputChangeHandler } from "@/features/downtime/hooks/useDowntimeForm";

interface LogDowntimeModalProps {
  open: boolean;
  onClose: () => void;
}

const getDefaultFormData = (): CreateDowntimeInput => ({
  assetIds: [],
  priority: "Low",
  status: "Down",
  description: "",
  startTime: new Date().toISOString(),
  resolutionNotes: "",
});

export function LogDowntimeModal({ open, onClose }: LogDowntimeModalProps) {
  const [formData, setFormData] = useState<CreateDowntimeInput>(() => getDefaultFormData());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(DEFAULT_ASSET_CATEGORY);

  const { errors, setFieldErrors, clearErrors } = useFormErrors();
  const { assetCategories, allAssetItemsMap } = useAssetCategories();
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
    setSelectedCategoryId(DEFAULT_ASSET_CATEGORY);
  }, [setFieldErrors]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const createMutation = useCreateDowntimeIncident(handleClose);

  // Reset form when modal opens
  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      const validation = createDowntimeSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          fieldErrors[issue.path.join(".")] = issue.message;
        });
        setFieldErrors(fieldErrors);
        return;
      }

      setFieldErrors({});
      createMutation.mutate(validation.data);
    },
    [formData, createMutation, setFieldErrors]
  );

  const handleStatusSelect = useCallback(
    (status: CreateDowntimeInput["status"]) => {
      setFormData((prev) => {
        const newData: CreateDowntimeInput = {
          ...prev,
          status,
          endTime: status === "Resolved" ? prev.endTime ?? new Date().toISOString() : undefined,
        };

        // When switching to Resolved, move description to resolutionNotes if resolutionNotes is empty
        if (status === "Resolved" && !prev.resolutionNotes && prev.description) {
          newData.resolutionNotes = prev.description;
          newData.description = "";
        }
        // When switching from Resolved to Down, move resolutionNotes to description if description is empty
        else if (status === "Down" && !prev.description && prev.resolutionNotes) {
          newData.description = prev.resolutionNotes;
          newData.resolutionNotes = "";
        }

        return newData;
      });
      clearErrors("status", "endTime", "description", "resolutionNotes");
    },
    [clearErrors]
  );

  const handleDescriptionChange = handleInputChange("description");
  const handleResolutionNotesChange = handleInputChange("resolutionNotes");

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { 
      if (!isOpen) handleClose(); 
    }}>
      <DialogContent className="w-[600px] max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Log New Downtime Incident</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pr-1">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">Priority<span className="text-error">*</span></label>
                <DropdownMenu className="w-full">
                  <DropdownMenuTrigger label={formData.priority} className="w-full justify-between" />
                  <DropdownMenuContent matchTriggerWidth>
                    {PRIORITY_OPTIONS.map((option) => (
                      <DropdownMenuItem key={option.value} onClick={() => { handlePrioritySelect(option.value); }}>{option.label}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">Status<span className="text-error">*</span></label>
                <DropdownMenu className="w-full">
                  <DropdownMenuTrigger label={formData.status} className="w-full justify-between" />
                  <DropdownMenuContent matchTriggerWidth>
                    {STATUS_OPTIONS.map((option) => (
                      <DropdownMenuItem key={option.value} onClick={() => { handleStatusSelect(option.value); }}>{option.label}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {formData.status === "Resolved" ? (
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            ) : (
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
            )}

            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">
                {formData.status === "Resolved" ? "Resolution Notes" : "Description"}
                <span className="text-error">*</span>
              </label>
              <TextArea
                value={formData.status === "Resolved" ? (formData.resolutionNotes ?? "") : (formData.description ?? "")}
                onChange={formData.status === "Resolved" ? handleResolutionNotesChange : handleDescriptionChange}
                placeholder={formData.status === "Resolved" ? "Describe the resolution..." : "Describe the issue..."}
                className="min-h-[90px]"
              />
              {formData.status === "Resolved" ? (
                errors.resolutionNotes && (
                  <span className="text-sm text-error">{errors.resolutionNotes}</span>
                )
              ) : (
                errors.description && (
                  <span className="text-sm text-error">{errors.description}</span>
                )
              )}
            </div>
          </form>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
          <Button variant="default" type="submit" disabled={createMutation.isPending} onClick={() => { handleSubmit(); }}>
            {createMutation.isPending ? "Logging..." : "Log Incident"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
