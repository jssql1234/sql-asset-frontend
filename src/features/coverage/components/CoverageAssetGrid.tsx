import type { ReactNode } from "react";
import type { CoverageClaim, CoveragePolicy, CoverageWarranty } from "@/features/coverage/types";

interface AssetItem {
  id: string;
  name: string;
}

interface CoverageAssetGridProps {
  assets: AssetItem[];
  action?: (asset: AssetItem) => ReactNode;
  footer?: ReactNode;
}

type ExtractedAsset = AssetItem | CoverageClaim["assets"][number] | CoveragePolicy["assetsCovered"][number] | CoverageWarranty["assetsCovered"][number];

const normalizeAssets = (assets: ExtractedAsset[]): AssetItem[] => {
  return assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
  }));
};

export const CoverageAssetGrid = ({
  assets,
  action,
  footer,
}: CoverageAssetGridProps) => {
  const normalized = normalizeAssets(assets);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {normalized.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between rounded-md border border-outlineVariant bg-surfaceContainerLowest px-3 py-2"
          >
            <div className="flex flex-col">
              <span className="font-medium text-onSurface">{asset.name}</span>
              <span className="body-small text-onSurfaceVariant">{asset.id}</span>
            </div>
            {action ? action(asset) : null}
          </div>
        ))}
      </div>
      {footer}
    </div>
  );
};
