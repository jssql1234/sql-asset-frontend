import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { DowntimeIncident } from "@/features/downtime/types";
import type { CreateDowntimeInput, EditDowntimeInput } from "@/features/downtime/zod/downtimeSchemas";
import { createDowntimeSchema, editDowntimeSchema } from "@/features/downtime/zod/downtimeSchemas";
import { useCreateDowntimeIncident, useUpdateDowntimeIncident } from "@/features/downtime/hooks/useDowntimeService";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/features/downtime/constants";
import { DEFAULT_ASSET_CATEGORY, useAssetCategories, useAssetItems, useFormErrors, useDateTimeChange, useAssetSelectionHandler, usePriorityHandler, useInputChangeHandler } from "@/features/downtime/hooks/useDowntimeForm";

interface LogDowntimeModalProps {
  open: boolean;
  onClose: () => void;
  incident?: DowntimeIncident | null;
}

type DowntimeFormState = CreateDowntimeInput & {
  id?: string;
  resolvedBy?: string;
};

const buildInitialFormState = (incident?: DowntimeIncident | null): DowntimeFormState => {
  const base: DowntimeFormState = {
    id: incident?.id,
    assetIds: incident?.assets.map((asset) => asset.id) ?? [],
    priority: incident?.priority ?? "Low",
    status: incident?.status ?? "Down",
    description: incident?.description ?? "",
    startTime: incident?.startTime ?? new Date().toISOString(),
    endTime: incident?.endTime,
    resolutionNotes: incident?.resolutionNotes ?? "",
    reportedBy: incident?.reportedBy,
    resolvedBy: incident?.resolvedBy,
  };

  if (base.status !== "Resolved") {
    base.resolutionNotes = "";
    base.endTime = undefined;
  }

  return base;
};

export function LogDowntimeModal({ open, onClose, incident }: LogDowntimeModalProps) {
  const isEditing = Boolean(incident);

  const [formData, setFormData] = useState<DowntimeFormState>(() => buildInitialFormState());
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
    setFormData(buildInitialFormState());
    setFieldErrors({});
    setSelectedCategoryId(DEFAULT_ASSET_CATEGORY);
  }, [setFieldErrors]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const createMutation = useCreateDowntimeIncident(handleClose);
  const updateMutation = useUpdateDowntimeIncident(handleClose);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormData(buildInitialFormState(incident));
    setFieldErrors({});
    setSelectedCategoryId(incident?.assets[0]?.groupId ?? DEFAULT_ASSET_CATEGORY);
  }, [incident, open, setFieldErrors]);

  const handleSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (isEditing) {
        const payload: EditDowntimeInput = {
          id: incident?.id ?? formData.id ?? "",
          assetIds: formData.assetIds,
          priority: formData.priority,
          status: formData.status,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          resolutionNotes: formData.resolutionNotes,
          reportedBy: formData.reportedBy,
          resolvedBy: formData.resolvedBy,
        };

        const validation = editDowntimeSchema.safeParse(payload);

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
        return;
      }

      const payload: CreateDowntimeInput = {
        assetIds: formData.assetIds,
        priority: formData.priority,
        status: formData.status,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
        resolutionNotes: formData.resolutionNotes,
        reportedBy: formData.reportedBy,
      };

      const validation = createDowntimeSchema.safeParse(payload);

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          fieldErrors[issue.path.join(".")] = issue.message;
        });
        setFieldErrors(fieldErrors);
        return;
      }

      setFieldErrors({});
      await createMutation.mutateAsync(validation.data);
    },
    [createMutation, formData, incident, isEditing, setFieldErrors, updateMutation]
  );

  const handleStatusSelect = useCallback(
    (status: CreateDowntimeInput["status"]) => {
      setFormData((prev) => {
        const isResolving = status === "Resolved";
        const next: DowntimeFormState = {
          ...prev,
          status,
          endTime: isResolving ? prev.endTime ?? new Date().toISOString() : undefined,
        };

        if (isResolving) {
          if (!prev.resolutionNotes && prev.description) {
            next.resolutionNotes = prev.description;
            next.description = "";
          }
        } else {
          if (!prev.description && prev.resolutionNotes) {
            next.description = prev.resolutionNotes;
          }
          next.resolutionNotes = "";
        }

        return next;
      });
      clearErrors("status", "endTime", "description", "resolutionNotes");
    },
    [clearErrors]
  );

  const handleDescriptionChange = handleInputChange("description");
  const handleResolutionNotesChange = handleInputChange("resolutionNotes");

  const isSubmitting = isEditing ? updateMutation.isPending : createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="w-full max-w-[700px] h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditing ? "Edit Downtime Incident" : "Log New Downtime Incident"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <form onSubmit={(e) => { void handleSubmit(e); }} className="flex h-full flex-col gap-4 pr-1">
            <div className="flex flex-col gap-2">
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
              {errors.assetIds ? <span className="text-sm text-error">{errors.assetIds}</span> : null}
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
                    value={formData.startTime ? new Date(formData.startTime) : null}
                    onChange={handleDateTimeChange("startTime")}
                    inputType="dateTime"
                    className="w-full"
                  />
                  {errors.startTime ? <span className="text-sm text-error">{errors.startTime}</span> : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="label-medium text-onSurface">End Time<span className="text-error">*</span></label>
                  <SemiDatePicker
                    value={formData.endTime ? new Date(formData.endTime) : null}
                    onChange={handleDateTimeChange("endTime")}
                    inputType="dateTime"
                    className="w-full"
                  />
                  {errors.endTime ? <span className="text-sm text-error">{errors.endTime}</span> : null}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">Start Time<span className="text-error">*</span></label>
                <SemiDatePicker
                  value={formData.startTime ? new Date(formData.startTime) : null}
                  onChange={handleDateTimeChange("startTime")}
                  inputType="dateTime"
                  className="w-full"
                />
                {errors.startTime ? <span className="text-sm text-error">{errors.startTime}</span> : null}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">
                {formData.status === "Resolved" ? "Resolution Notes" : "Description"}
                <span className="text-error">*</span>
              </label>
              <TextArea
                value={formData.status === "Resolved" ? formData.resolutionNotes ?? "" : formData.description ?? ""}
                onChange={formData.status === "Resolved" ? handleResolutionNotesChange : handleDescriptionChange}
                placeholder={formData.status === "Resolved" ? "Describe the resolution..." : "Describe the issue..."}
                className="min-h-[90px]"
              />
              {formData.status === "Resolved"
                ? errors.resolutionNotes ? <span className="text-sm text-error">{errors.resolutionNotes}</span> : null
                : errors.description ? <span className="text-sm text-error">{errors.description}</span> : null}
            </div>
            <DialogFooter className="mt-auto flex-shrink-0">
              <Button variant="outline" type="button" onClick={handleClose}>Cancel</Button>
              <Button variant="default" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? "Updating..." : "Logging...") : isEditing ? "Update Incident" : "Log Incident"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
