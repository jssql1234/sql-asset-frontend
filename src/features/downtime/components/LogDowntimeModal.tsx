import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { SemiDatePicker } from "@/components/ui/components/DateTimePicker";
import { TextArea } from "@/components/ui/components/Input";
import { SearchWithDropdown } from "@/components/SearchWithDropdown";
import type { CreateDowntimeInput } from "@/features/downtime/zod/downtimeSchemas";
import { createDowntimeSchema } from "@/features/downtime/zod/downtimeSchemas";
import { useCreateDowntimeIncident } from "@/features/downtime/hooks/useDowntimeService";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/features/downtime/constants";
import { downtimeAssetGroups, downtimeAssets } from "@/features/downtime/mockData";

interface LogDowntimeModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_ASSET_CATEGORY = "all";

interface AssetDropdownItem {
  id: string;
  label: string;
  sublabel?: string;
  groupId: string;
  groupLabel: string;
}

export const LogDowntimeModal: React.FC<LogDowntimeModalProps> = ({
  open,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateDowntimeInput>({
    assetIds: [],
    priority: "Medium",
    status: "Down",
    description: "",
    startTime: new Date().toISOString(),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(DEFAULT_ASSET_CATEGORY);
  
  const createMutation = useCreateDowntimeIncident(() => {
    handleClose();
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        assetIds: [],
        priority: "Medium",
        status: "Down",
        description: "",
        startTime: new Date().toISOString(),
      });
      setErrors({});
      setSelectedCategoryId(DEFAULT_ASSET_CATEGORY);
    }
  }, [open]);

  const handleClose = () => {
    setFormData({
      assetIds: [],
      priority: "Medium",
      status: "Down",
      description: "",
      startTime: new Date().toISOString(),
    });
    setErrors({});
    setSelectedCategoryId(DEFAULT_ASSET_CATEGORY);
    onClose();
  };

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

  const allAssetItems = useMemo<AssetDropdownItem[]>(
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

  const assetItemMap = useMemo(() => {
    const map = new Map<string, AssetDropdownItem>();
    allAssetItems.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [allAssetItems]);

  const assetItems = useMemo(() => {
    const baseItems =
      selectedCategoryId === DEFAULT_ASSET_CATEGORY
        ? allAssetItems
        : allAssetItems.filter((item) => item.groupId === selectedCategoryId);

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
  }, [selectedCategoryId, allAssetItems, formData.assetIds, assetItemMap]);

  const handleAssetSelectionChange = (selectedIds: string[]) => {
    setFormData((prev) => ({ ...prev, assetIds: selectedIds }));
    setErrors((prev) => ({
      ...prev,
      assetIds: selectedIds.length === 0 ? "Select at least one asset" : "",
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
    void createMutation.mutate(validation.data);
  };

  const handlePrioritySelect = (priority: CreateDowntimeInput["priority"]) => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const handleStatusSelect = (status: CreateDowntimeInput["status"]) => {
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
    setErrors((prev) => ({ ...prev, status: "", endTime: "" }));
  };

  const handleDateTimeChange = (date: string | Date | Date[] | string[] | undefined | null) => {
    if (date === null || date === undefined || (Array.isArray(date) && date.length === 0)) {
      setFormData((prev) => ({ ...prev, startTime: "" }));
      setErrors((prev) => ({ ...prev, startTime: "" }));
      return;
    }

    if (date instanceof Date) {
      setFormData((prev) => ({ ...prev, startTime: date.toISOString() }));
    } else if (typeof date === "string") {
      setFormData((prev) => ({ ...prev, startTime: date }));
    }
    setErrors((prev) => ({ ...prev, startTime: "" }));
  };

  const handleEndDateTimeChange = (date: string | Date | Date[] | string[] | undefined | null) => {
    if (date === null || date === undefined || (Array.isArray(date) && date.length === 0)) {
      setFormData((prev) => ({ ...prev, endTime: undefined }));
      setErrors((prev) => ({ ...prev, endTime: "" }));
      return;
    }

    if (date instanceof Date) {
      setFormData((prev) => ({ ...prev, endTime: date.toISOString() }));
    } else if (typeof date === "string") {
      setFormData((prev) => ({ ...prev, endTime: date }));
    }
    setErrors((prev) => ({ ...prev, endTime: "" }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
    setErrors((prev) => ({ ...prev, description: "" }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="w-[600px] max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Log New Downtime Incident</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pr-1">
            <div className="flex flex-col gap-2">
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
            </div>

            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">Priority*</label>
              <DropdownMenu className="w-full">
                <DropdownMenuTrigger
                  label={formData.priority}
                  className="w-full justify-between"
                />
                <DropdownMenuContent matchTriggerWidth>
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

            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">Status*</label>
              <DropdownMenu className="w-full">
                <DropdownMenuTrigger
                  label={formData.status}
                  className="w-full justify-between"
                />
                <DropdownMenuContent matchTriggerWidth>
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

            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">Start Time*</label>
              <SemiDatePicker
                value={formData.startTime ? new Date(formData.startTime) : null}
                onChange={handleDateTimeChange}
                inputType="dateTime"
                className="w-full"
              />
              {errors.startTime && (
                <span className="text-sm text-error">{errors.startTime}</span>
              )}
            </div>

            {formData.status === "Resolved" && (
              <div className="flex flex-col gap-2">
                <label className="label-medium text-onSurface">End Time*</label>
                <SemiDatePicker
                  value={formData.endTime ? new Date(formData.endTime) : null}
                  onChange={handleEndDateTimeChange}
                  inputType="dateTime"
                  className="w-full"
                />
                {errors.endTime && (
                  <span className="text-sm text-error">{errors.endTime}</span>
                )}
              </div>
            )}

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
          </form>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="default"
            type="submit"
            disabled={createMutation.isPending}
            onClick={handleSubmit}
          >
            {createMutation.isPending ? "Logging..." : "Log Incident"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
