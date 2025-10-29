import React, { useState, useEffect, useMemo, useCallback } from "react";
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

const DEFAULT_ASSET_CATEGORY = "all" as const;

interface AssetDropdownItem {
  id: string;
  label: string;
  groupId: string;
  groupLabel: string;
}

const getDefaultFormData = (): CreateDowntimeInput => ({
  assetIds: [],
  priority: "Medium",
  status: "Down",
  description: "",
  startTime: new Date().toISOString(),
});

export const LogDowntimeModal: React.FC<LogDowntimeModalProps> = ({
  open,
  onClose,
}) => {
  const [formData, setFormData] = useState<CreateDowntimeInput>(getDefaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(DEFAULT_ASSET_CATEGORY);
  
  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
    setErrors({});
    setSelectedCategoryId(DEFAULT_ASSET_CATEGORY);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const createMutation = useCreateDowntimeIncident(handleClose);

  // Reset form when modal opens
  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  const assetCategories = useMemo(
    () => [
      { id: DEFAULT_ASSET_CATEGORY, label: "All Assets" },
      ...downtimeAssetGroups.map((group) => ({
        id: group.id,
        label: group.label,
      })),
    ],
    []
  );

  const allAssetItemsMap = useMemo(() => {
    const map = new Map<string, AssetDropdownItem>();
    downtimeAssets.forEach((asset) => {
      map.set(asset.id, {
        id: asset.id,
        label: `${asset.name} (${asset.id})`,
        groupId: asset.groupId,
        groupLabel: asset.groupLabel,
      });
    });
    return map;
  }, []);

  const assetItems = useMemo(() => {
    const allItems = Array.from(allAssetItemsMap.values());
    const filteredItems = selectedCategoryId === DEFAULT_ASSET_CATEGORY
      ? allItems
      : allItems.filter((item) => item.groupId === selectedCategoryId);

    const itemMap = new Map<string, AssetDropdownItem>();
    filteredItems.forEach((item) => itemMap.set(item.id, item));

    formData.assetIds.forEach((id) => {
      if (!itemMap.has(id)) {
        const match = allAssetItemsMap.get(id);
        if (match) itemMap.set(id, match);
      }
    });

    return Array.from(itemMap.values());
  }, [selectedCategoryId, allAssetItemsMap, formData.assetIds]);

  const handleAssetSelectionChange = useCallback((selectedIds: string[]) => {
    setFormData((prev) => ({ ...prev, assetIds: selectedIds }));
    setErrors((prev) => ({
      ...prev,
      assetIds: selectedIds.length === 0 ? "Select at least one asset" : "",
    }));
  }, []);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();

    const validation = createDowntimeSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        fieldErrors[issue.path.join(".")] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    createMutation.mutate(validation.data);
  }, [formData, createMutation]);

  const handlePrioritySelect = useCallback((priority: CreateDowntimeInput["priority"]) => {
    setFormData((prev) => ({ ...prev, priority }));
  }, []);

  const handleStatusSelect = useCallback((status: CreateDowntimeInput["status"]) => {
    setFormData((prev) => ({
      ...prev,
      status,
      endTime: status === "Resolved" ? prev.endTime ?? new Date().toISOString() : undefined,
    }));
    setErrors((prev) => ({ ...prev, status: "", endTime: "" }));
  }, []);

  const handleDateTimeChange = useCallback((field: "startTime" | "endTime") => (
    date: string | Date | Date[] | string[] | undefined | null
  ) => {
    if (date === null || date === undefined || (Array.isArray(date) && date.length === 0)) {
      setFormData((prev) => ({ ...prev, [field]: field === "endTime" ? undefined : "" }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
    setFormData((prev) => ({ ...prev, [field]: isoDate }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
    setErrors((prev) => ({ ...prev, description: "" }));
  }, []);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { 
      if (!isOpen) handleClose(); 
    }}>
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
                <DropdownMenuTrigger label={formData.priority} className="w-full justify-between" />
                <DropdownMenuContent matchTriggerWidth>
                  {PRIORITY_OPTIONS.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => { handlePrioritySelect(option.value); }}>
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-2">
              <label className="label-medium text-onSurface">Status*</label>
              <DropdownMenu className="w-full">
                <DropdownMenuTrigger label={formData.status} className="w-full justify-between" />
                <DropdownMenuContent matchTriggerWidth>
                  {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => { handleStatusSelect(option.value); }}>
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
                onChange={handleDateTimeChange("startTime")}
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
                  onChange={handleDateTimeChange("endTime")}
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
          <Button variant="default" type="submit" disabled={createMutation.isPending} onClick={handleSubmit}>
            {createMutation.isPending ? "Logging..." : "Log Incident"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
