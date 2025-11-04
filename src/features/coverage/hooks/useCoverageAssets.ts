import { useMemo } from "react";
import { coverageAssets, coverageAssetGroups } from "@/features/coverage/mockData";

export interface CoverageAssetOption {
  id: string;
  label: string;
  sublabel?: string;
}

export interface CoverageAssetCatalog {
  assetCategories: CoverageAssetOption[];
  assetOptions: CoverageAssetOption[];
  assetNameById: Map<string, string>;
}

export function useCoverageAssetCatalog(): CoverageAssetCatalog {
  const assetCategories = useMemo(
    () => [
      { id: "all", label: "All Assets" },
      ...coverageAssetGroups.map((group) => ({ id: group.id, label: group.label })),
    ],
    []
  );

  const assetOptions = useMemo(
    () =>
      coverageAssets.map((asset) => ({
        id: asset.id,
        label: `${asset.name} (${asset.id})`,
        sublabel: asset.groupLabel,
      })),
    []
  );

  const assetNameById = useMemo(() => {
    const map = new Map<string, string>();
    assetOptions.forEach((option) => {
      const [name] = option.label.split(" (");
      map.set(option.id, name);
    });
    return map;
  }, [assetOptions]);

  return {
    assetCategories,
    assetOptions,
    assetNameById,
  };
}
