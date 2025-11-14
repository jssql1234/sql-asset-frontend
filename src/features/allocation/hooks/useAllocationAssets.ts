import { useCallback, useEffect, useMemo, useState } from "react";
import type { AssetRecord, AllocationCategoryOption, AllocationItemOption, UseAllocationAssetsResult } from "../types";

export function useAllocationAssets(assets: AssetRecord[]): UseAllocationAssetsResult {
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  const assetCategories = useMemo<AllocationCategoryOption[]>(() => {
    const categories = Array.from(new Set(assets.map((asset) => asset.category)));

    return [
      { id: "all", label: "All Categories" },
      ...categories.map((category) => ({
        id: category,
        label: category,
      })),
    ];
  }, [assets]);

  const assetItems = useMemo<AllocationItemOption[]>(() => {
    return assets.map((asset) => ({
      id: asset.id,
      label: `${asset.name} (${asset.code})`,
      sublabel: asset.category,
    }));
  }, [assets]);

  const handleAssetSelectionChange = useCallback((assetIds: string[]) => {
    setSelectedAssetIds(assetIds);
  }, []);

  useEffect(() => {
    const validIds = new Set(assets.map((asset) => asset.id));
    setSelectedAssetIds((previous) => previous.filter((id) => validIds.has(id)));
  }, [assets]);

  const resetAssetSelection = useCallback(() => {
    setSelectedAssetIds([]);
    setSelectedCategoryId("all");
  }, []);

  return { assetCategories, assetItems, selectedAssetIds, selectedCategoryId, setSelectedCategoryId, handleAssetSelectionChange, resetAssetSelection };
}
