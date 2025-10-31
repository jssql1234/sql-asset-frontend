import { useState, useCallback, useMemo } from "react";
import { downtimeAssetGroups, downtimeAssets } from "../mockData";
import type { DowntimeIncident } from "../types";

export const DEFAULT_ASSET_CATEGORY = "all" as const;
export interface AssetDropdownItem { id: string; label: string; groupId: string; groupLabel: string }

//Custom hook for managing asset categories and filtering logic (Shared between EditIncidentModal and LogDowntimeModal)
export function useAssetCategories(incident?: DowntimeIncident | null) {
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

    // Add incident assets if available
    incident?.assets.forEach((asset) => {
      if (!map.has(asset.id)) {
        map.set(asset.id, {
          id: asset.id,
          label: `${asset.name} (${asset.id})`,
          groupId: asset.groupId ?? DEFAULT_ASSET_CATEGORY,
          groupLabel: asset.groupLabel ?? "Other Assets",
        });
      }
    });

    return map;
  }, [incident]);

  return { assetCategories, allAssetItemsMap };
}

/**
 * Custom hook for filtering asset items based on selected category
 * Ensures selected assets are always included in the list
 */
export function useFilteredAssetItems(
  selectedCategoryId: string,
  allAssetItemsMap: Map<string, AssetDropdownItem>,
  selectedAssetIds: string[]
) {
  return useMemo(() => {
    const allItems = Array.from(allAssetItemsMap.values());
    const filteredItems =
      selectedCategoryId === DEFAULT_ASSET_CATEGORY ? allItems : allItems.filter((item) => item.groupId === selectedCategoryId);

    const itemMap = new Map<string, AssetDropdownItem>();
    filteredItems.forEach((item) => itemMap.set(item.id, item));

    // Ensure selected assets are always included
    selectedAssetIds.forEach((id) => {
      if (!itemMap.has(id)) {
        const match = allAssetItemsMap.get(id);
        if (match) itemMap.set(id, match);
      }
    });

    return Array.from(itemMap.values());
  }, [selectedCategoryId, allAssetItemsMap, selectedAssetIds]);
}

//Custom hook for managing form validation errors
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = useCallback((field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const clearErrors = useCallback((...fields: string[]) => {
    setErrors((prev) => {
      const updated = { ...prev };
      fields.forEach((field) => {
        updated[field] = "";
      });
      return updated;
    });
  }, []);

  const setFieldErrors = useCallback((fieldErrors: Record<string, string>) => {
    setErrors(fieldErrors);
  }, []);

  return { errors, setErrors, clearError, clearErrors, setFieldErrors };
}

//Custom hook for managing date/time input changes
export function useDateTimeChange<T extends Record<string, unknown>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  clearError: (field: string) => void
) {
  return useCallback(
    (field: keyof T) => (date: string | Date | Date[] | string[] | undefined | null) => {
      if (date === null || date === undefined || (Array.isArray(date) && date.length === 0)) {
        setFormData((prev) => ({
          ...prev,
          [field]: field === "endTime" ? undefined : "",
        }));
        clearError(String(field));
        return;
      }

      const isoDate = date instanceof Date ? date.toISOString() : typeof date === "string" ? date : "";
      setFormData((prev) => ({ ...prev, [field]: isoDate }));
      clearError(String(field));
    },
    [setFormData, clearError]
  );
}

// Custom hook for handling asset selection changes
export function useAssetSelectionHandler<T extends { assetIds: string[] }>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  clearErrors: (...fields: string[]) => void
) {
  return useCallback(
    (selectedIds: string[]) => {
      setFormData((prev) => ({ ...prev, assetIds: selectedIds }));
      clearErrors(selectedIds.length === 0 ? "" : "assetIds");
    },
    [setFormData, clearErrors]
  );
}

// Custom hook for handling priority selection
export function usePriorityHandler<T extends { priority: string }>(
  setFormData: React.Dispatch<React.SetStateAction<T>>
) {
  return useCallback(
    (priority: T["priority"]) => {
      setFormData((prev) => ({ ...prev, priority }));
    },
    [setFormData]
  );
}

// Custom hook for handling input changes with error clearing
export function useInputChangeHandler<T extends Record<string, unknown>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>,
  clearErrors: (...fields: string[]) => void
) {
  return useCallback(
    (field: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
      clearErrors(String(field));
    },
    [setFormData, clearErrors]
  );
}
