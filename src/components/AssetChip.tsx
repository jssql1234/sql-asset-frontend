import { Button } from "@/components/ui/components";
import { cn } from "@/utils/utils";
import type { AssignedAsset } from "../features/meter";

const chipBaseClasses =
  "inline-flex items-center gap-2 rounded-full border border-outlineVariant bg-tertiaryContainer px-3 py-1 text-xs font-semibold text-onTertiaryContainer";

interface BaseAssetChipProps {
  asset: AssignedAsset;
  className?: string;
}

const AssetChipLabel = ({ asset }: { asset: AssignedAsset }) => (
  <span className="leading-none">
    {asset.name}
    {asset.code ? (
      <span className="ml-1 text-[11px] font-normal text-onSurfaceVariant">
        ({asset.code})
      </span>
    ) : null}
  </span>
);

const AssetChip = ({ asset, className }: BaseAssetChipProps) => (
  <span className={cn(chipBaseClasses, className)}>
    <AssetChipLabel asset={asset} />
  </span>
);

interface AssetChipWithRemoveProps extends BaseAssetChipProps {
  onDelete: () => void;
}

const RemovableAssetChip = ({
  asset,
  onDelete,
  className,
}: AssetChipWithRemoveProps) => (
  <span className={cn(chipBaseClasses, className)}>
    <AssetChipLabel asset={asset} />
    <Button
      variant="destructive"
      size="sm"
      className="h-4 w-4 rounded-full p-0 text-xs"
      aria-label={`Remove ${asset.name}`}
      onClick={onDelete}
    >
      ×
    </Button>
  </span>
);

export {
    AssetChip,
    RemovableAssetChip
};    
export type { AssetChipWithRemoveProps };

