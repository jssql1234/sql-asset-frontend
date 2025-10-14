import { Button } from "@/components/ui/components";
import { AssetChip } from "@/components/AssetChip";
import type { Asset } from "@/types/asset";

type AssignedAssetsSectionProps = {
  assets: Asset[];
  onAssignAssets: () => void;
};

export const AssignedAssetsSection = ({
  assets,
  onAssignAssets,
}: AssignedAssetsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-onSurface">Assigned Assets</h2>
        <Button variant="primary" size="sm" onClick={onAssignAssets}>
          Assign Assets
        </Button>
      </div>
      {assets.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {assets.map((asset) => (
            <AssetChip key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <p className="text-onSurfaceVariant">No assets assigned to this group.</p>
      )}
    </div>
  );
};

export default AssignedAssetsSection;
