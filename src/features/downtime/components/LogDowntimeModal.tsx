import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import type { CreateDowntimeInput } from "@/features/downtime/zod/downtimeSchemas";
import { createDowntimeSchema } from "@/features/downtime/zod/downtimeSchemas";
import { useCreateDowntimeIncident } from "@/features/downtime/hooks/useDowntimeService";

interface LogDowntimeModalProps {
  open: boolean;
  onClose: () => void;
}

const assetOptions = [
  { value: "CBT-001", label: "Conveyor Belt A1" },
  { value: "PMP-002", label: "Pump System B2" },
  { value: "GEN-003", label: "Generator C3" },
  { value: "CMP-004", label: "Compressor D4" },
  { value: "HP-005", label: "Hydraulic Press E5" },
  { value: "CS-006", label: "Cooling System F6" },
];

const priorityOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
] as const;

export const LogDowntimeModal: React.FC<LogDowntimeModalProps> = ({
  open,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateDowntimeInput>({
    assetId: "",
    priority: "Medium",
    description: "",
    startTime: new Date().toISOString(),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createMutation = useCreateDowntimeIncident(() => {
    handleClose();
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        assetId: "",
        priority: "Medium",
        description: "",
        startTime: new Date().toISOString(),
      });
      setErrors({});
    }
  }, [open]);

  const handleClose = () => {
    setFormData({
      assetId: "",
      priority: "Medium",
      description: "",
      startTime: new Date().toISOString(),
    });
    setErrors({});
    onClose();
  };

  const getSelectedAssetLabel = () => {
    const option = assetOptions.find(opt => opt.value === formData.assetId);
    return option?.label || "Select Asset";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = createDowntimeSchema.safeParse(formData);
    
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
    createMutation.mutate(validation.data);
  };

  const handleAssetSelect = (assetId: string) => {
    setFormData(prev => ({ ...prev, assetId }));
    setErrors(prev => ({ ...prev, assetId: "" }));
  };

  const handlePrioritySelect = (priority: CreateDowntimeInput["priority"]) => {
    setFormData(prev => ({ ...prev, priority }));
  };

  const handleDateTimeChange = (date: string | Date | Date[] | string[] | undefined) => {
    if (date instanceof Date) {
      setFormData(prev => ({ ...prev, startTime: date.toISOString() }));
    } else if (typeof date === 'string') {
      setFormData(prev => ({ ...prev, startTime: date }));
    }
    setErrors(prev => ({ ...prev, startTime: "" }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
    setErrors(prev => ({ ...prev, description: "" }));
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log New Downtime Incident</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Asset Selection */}
          <div className="flex flex-col gap-2">
            <label className="label-medium text-onSurface">Asset*</label>
            <DropdownMenu className="w-full">
              <DropdownMenuTrigger 
                label={getSelectedAssetLabel()} 
                className="w-full justify-between" 
              />
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
            {errors.assetId && (
              <span className="text-sm text-error">{errors.assetId}</span>
            )}
          </div>

          {/* Priority Selection */}
          <div className="flex flex-col gap-2">
            <label className="label-medium text-onSurface">Priority*</label>
            <DropdownMenu className="w-full">
              <DropdownMenuTrigger 
                label={formData.priority} 
                className="w-full justify-between" 
              />
              <DropdownMenuContent>
                {priorityOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handlePrioritySelect(option.value)}
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
              onChange={handleDateTimeChange}
              inputType="dateTime"
              className="w-full"
            />
            {errors.startTime && (
              <span className="text-sm text-error">{errors.startTime}</span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="label-medium text-onSurface">Description*</label>
            <TextArea
              value={formData.description}
              onChange={handleDescriptionChange}
              placeholder="Describe the issue... (minimum 10 characters)"
              className="min-h-[100px]"
            />
            {errors.description && (
              <span className="text-sm text-error">{errors.description}</span>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="default"
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Logging..." : "Log Incident"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};