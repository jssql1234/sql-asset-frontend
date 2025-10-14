import { Button } from "@/components/ui/components";
import { cn } from "@/utils/utils";
import type { Asset } from "@/types/asset";

const chipBaseClasses =
  "inline-flex items-center gap-2 rounded-full bg-primaryContainer px-3 py-1 text-xs font-semibold text-onTertiaryContainer";

interface BaseAssetChipProps {
  asset: Asset;
  className?: string;
}

const AssetChipLabel = ({ asset }: { asset: Asset }) => (
  <span className="leading-none text-onPrimaryContainer">
    {asset.name}
    {asset.id ? (
      <span className="ml-1 text-[11px] font-normal">
        ({asset.id})
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

