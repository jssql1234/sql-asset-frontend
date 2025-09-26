import React, { useState } from "react";
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
import type { DowntimeFormData } from "../types/downtime";

interface LogDowntimeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: DowntimeFormData) => void;
}

const assetOptions = [
  { value: "CBT-001", label: "Conveyor Belt A1" },
  { value: "PMP-002", label: "Pump System B2" },
  { value: "GEN-003", label: "Generator C3" },
  { value: "CMP-004", label: "Compressor D4" },
];

const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

export const LogDowntimeModal: React.FC<LogDowntimeModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<DowntimeFormData>({
    assetId: "",
    priority: "Medium",
    description: "",
    startTime: new Date().toISOString(),
  });

  const getSelectedAssetLabel = () => {
    const option = assetOptions.find(opt => opt.value === formData.assetId);
    return option?.label || "Select Asset";
  };

  const getSelectedPriorityLabel = () => {
    return formData.priority;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  const handleInputChange = (field: keyof DowntimeFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleAssetSelect = (assetId: string) => {
    setFormData(prev => ({ ...prev, assetId }));
  };

  const handlePrioritySelect = (priority: DowntimeFormData["priority"]) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleDateTimeChange = (field: keyof DowntimeFormData) => (date: string | Date | Date[] | string[] | undefined) => {
    if (date instanceof Date) {
      setFormData(prev => ({ ...prev, [field]: date.toISOString() }));
    } else if (typeof date === 'string') {
      setFormData(prev => ({ ...prev, [field]: date }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log New Downtime Incident</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Asset Selection */}
          <div className="flex flex-col gap-2">
            <label className="label-medium text-onSurface">Asset*</label>
            <DropdownMenu className="w-full">
              <DropdownMenuTrigger label={getSelectedAssetLabel()} className="w-full justify-between" />
              <DropdownMenuContent>
                {assetOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleAssetSelect(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
                    onClick={() => handlePrioritySelect(option.value as DowntimeFormData["priority"])}
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
        </form>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            type="submit"
            disabled={!formData.assetId || !formData.description.trim()}
            onClick={handleSubmit}
          >
            Log Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};