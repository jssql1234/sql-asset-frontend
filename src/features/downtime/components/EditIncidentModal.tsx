import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import type { DowntimeIncident } from "@/features/downtime/types";
import type { EditDowntimeInput } from "@/features/downtime/zod/downtimeSchemas";
import { editDowntimeSchema } from "@/features/downtime/zod/downtimeSchemas";
import { useUpdateDowntimeIncident, useDeleteDowntimeIncident } from "@/features/downtime/hooks/useDowntimeService";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/features/downtime/constants";
import { Trash2 } from "lucide-react";

interface EditIncidentModalProps {
  open: boolean;
  incident: DowntimeIncident | null;
  onClose: () => void;
}

export const EditIncidentModal: React.FC<EditIncidentModalProps> = ({
  open,
  incident,
  onClose,
}) => {
  const [formData, setFormData] = useState<EditDowntimeInput>({
    id: "",
    assetId: "",
    priority: "Medium",
    status: "Down",
    description: "",
    startTime: new Date().toISOString(),
    endTime: undefined,
    resolutionNotes: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
        assetId: incident.assetId,
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
    }
  }, [incident, open]);

  const handleClose = () => {
    setErrors({});
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const handleDeleteClick = () => {
    if (!incident) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!incident) return;
    deleteMutation.mutate(incident.id);
    setIsDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    updateMutation.mutate(validation.data);
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
    setFormData((prev) => ({
      ...prev,
      status,
      // If resolving, set end time to now if not already set
      endTime: status === "Resolved" && !prev.endTime ? new Date().toISOString() : prev.endTime,
    }));
    setErrors((prev) => ({ ...prev, status: "", endTime: "", resolutionNotes: "" }));
  };

  const handleDateTimeChange = (field: "startTime" | "endTime") => (date: string | Date | Date[] | string[] | undefined) => {
    if (date instanceof Date) {
      setFormData((prev) => ({ ...prev, [field]: date.toISOString() }));
    } else if (typeof date === "string") {
      setFormData((prev) => ({ ...prev, [field]: date }));
    } else if (field === "endTime" && date === undefined) {
      setFormData((prev) => ({ ...prev, [field]: undefined }));
    }
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!incident) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Incident</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Asset Name (Read-only) */}
          <div className="flex flex-col gap-2">
            <label className="label-medium text-onSurface">Asset</label>
            <div className="p-2 bg-surfaceContainerHighest border border-outlineVariant rounded text-onSurface body-medium">
              {incident.assetName} ({incident.assetId})
            </div>
          </div>

          {/* Priority Selection */}
          <div className="flex flex-col gap-2">
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
          </div>

          {/* Status Selection */}
          <div className="flex flex-col gap-2">
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
          </div>

          {/* Start Time */}
          <div className="flex flex-col gap-2">
            <label className="label-medium text-onSurface">Start Time*</label>
            <SemiDatePicker
              value={new Date(formData.startTime)}
              onChange={handleDateTimeChange("startTime")}
              inputType="dateTime"
              className="w-full"
            />
            {errors.startTime && (
              <span className="text-sm text-error">{errors.startTime}</span>
            )}
          </div>

          {/* End Time (show if resolved) */}
          {formData.status === "Resolved" && (
            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">
                End Time*
              </label>
              <SemiDatePicker
                value={formData.endTime ? new Date(formData.endTime) : null}
                onChange={handleDateTimeChange("endTime")}
                inputType="dateTime"
                className="w-full"
              />
              {errors.endTime && (
                <span className="text-sm text-error">{errors.endTime}</span>
              )}
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-2">
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
          </div>

          {/* Resolution Notes (show if resolved) */}
          {formData.status === "Resolved" && (
            <div className="flex flex-col gap-2">
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
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <Button
              variant="ghost"
              type="button"
              onClick={handleDeleteClick}
              className="text-error hover:text-error hover:bg-errorContainer"
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="default"
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Incident"}
              </Button>
            </div>
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
                {incident.assetName} ({incident.assetId})
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
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Incident"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};