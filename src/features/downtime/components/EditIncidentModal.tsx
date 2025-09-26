import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import type { DowntimeIncident, EditIncidentFormData } from "../types/downtime";

interface EditIncidentModalProps {
  open: boolean;
  incident: DowntimeIncident | null;
  onClose: () => void;
  onSubmit?: (data: EditIncidentFormData) => void;
}

const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

export const EditIncidentModal: React.FC<EditIncidentModalProps> = ({
  open,
  incident,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<EditIncidentFormData>({
    id: "",
    assetId: "",
    priority: "Medium",
    status: "Active",
    description: "",
    startTime: new Date().toISOString(),
    endTime: undefined,
    resolutionNotes: "",
  });

  // Update form data when incident changes
  useEffect(() => {
    if (incident) {
      setFormData({
        id: incident.id,
        assetId: incident.assetId,
        priority: incident.priority,
        status: incident.status,
        description: incident.description,
        startTime: incident.startTime,
        endTime: incident.endTime,
        resolutionNotes: incident.resolutionNotes || "",
      });
    }
  }, [incident]);

  const getSelectedPriorityLabel = () => {
    return formData.priority;
  };

  const getSelectedStatusLabel = () => {
    return formData.status;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const handleInputChange = (field: keyof EditIncidentFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePrioritySelect = (priority: DowntimeIncident["priority"]) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleStatusSelect = (status: DowntimeIncident["status"]) => {
    setFormData(prev => ({ 
      ...prev, 
      status,
      // If resolving, set end time to now
      endTime: status === "Resolved" ? new Date().toISOString() : prev.endTime
    }));
  };

  const handleDateTimeChange = (field: keyof EditIncidentFormData) => (date: string | Date | Date[] | string[] | undefined) => {
    if (date instanceof Date) {
      setFormData(prev => ({ ...prev, [field]: date.toISOString() }));
    } else if (typeof date === 'string') {
      setFormData(prev => ({ ...prev, [field]: date }));
    } else if (field === 'endTime' && date === undefined) {
      setFormData(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
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
              <DropdownMenuTrigger label={getSelectedPriorityLabel()} className="w-full justify-between" />
              <DropdownMenuContent>
                {priorityOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handlePrioritySelect(option.value as DowntimeIncident["priority"])}
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
              <DropdownMenuTrigger label={getSelectedStatusLabel()} className="w-full justify-between" />
              <DropdownMenuContent>
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleStatusSelect(option.value as DowntimeIncident["status"])}
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
          </div>

          {/* End Time (show if resolved or in progress) */}
          {(formData.status === "Resolved" || formData.status === "In Progress") && (
            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">
                End Time{formData.status === "Resolved" ? "*" : ""}
              </label>
              <SemiDatePicker
                value={formData.endTime ? new Date(formData.endTime) : null}
                onChange={handleDateTimeChange("endTime")}
                inputType="dateTime"
                className="w-full"
              />
            </div>
          )}

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="label-medium text-onSurface">Description*</label>
            <TextArea
              value={formData.description}
              onChange={handleInputChange("description")}
              placeholder="Describe the issue..."
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Resolution Notes (show if resolved) */}
          {formData.status === "Resolved" && (
            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">Resolution Notes</label>
              <TextArea
                value={formData.resolutionNotes || ""}
                onChange={handleInputChange("resolutionNotes")}
                placeholder="Describe how the issue was resolved..."
                className="min-h-[80px]"
              />
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            type="submit"
            disabled={!formData.description.trim() || (formData.status === "Resolved" && !formData.endTime)}
            onClick={handleSubmit}
          >
            Update Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};