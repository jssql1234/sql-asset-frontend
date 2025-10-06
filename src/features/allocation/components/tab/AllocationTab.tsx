import { useMemo } from "react";
import { Button, Card } from "@/components/ui/components";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import AllocationFilter, { type FilterOptions } from "../AllocationFilter";
import AllocationTable from "../AllocationTable";
import { getAllocationSummaryCards } from "../AllocationSummaryCards";
import type { AllocationFilters, AllocationSummary, AssetRecord,} from "../../types";

interface AllocationTabProps {
  assets: AssetRecord[];
  filters: AllocationFilters;
  summary: AllocationSummary;
  filterOptions: FilterOptions;
  selectedAssetIds: string[];
  onFilterChange: (filters: AllocationFilters) => void;
  onResetFilters: () => void;
  onSelectionChange: (assets: AssetRecord[]) => void;
  onOpenAllocationModal?: () => void;
  onOpenTransferModal?: () => void;
  onOpenReturnModal?: () => void;
  onInspectAsset?: (asset: AssetRecord) => void;
}

const AllocationTab: React.FC<AllocationTabProps> = ({
  assets,
  filters,
  summary,
  filterOptions,
  selectedAssetIds,
  onFilterChange,
  onResetFilters,
  onSelectionChange,
  onOpenAllocationModal,
  onOpenTransferModal,
  onOpenReturnModal,
  onInspectAsset,
}) => {
  const summaryCards = useMemo(
    () => getAllocationSummaryCards(summary),
    [summary]
  );

  return (
    <div className="flex h-full flex-col gap-6 p-2">
      <TabHeader
        title="Asset Allocation"
        subtitle="Monitor allocation status, utilization, and perform bulk actions."
        actions={[
          {
            label: "Bulk Return",
            onAction: () => onOpenReturnModal?.(),
            variant: "outline",
            size: "sm",
            disabled: !onOpenReturnModal,
          },
          {
            label: "Bulk Transfer",
            onAction: () => onOpenTransferModal?.(),
            variant: "outline",
            size: "sm",
            disabled: !onOpenTransferModal,
          },
          {
            label: "Bulk Allocation",
            onAction: () => onOpenAllocationModal?.(),
            size: "sm",
            disabled: !onOpenAllocationModal,
          },
        ]}
      />

      <SummaryCards data={summaryCards} />

      <AllocationFilter
        filters={filters}
        options={filterOptions}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
      />

      <Card className="flex flex-1 flex-col gap-4 border border-outline bg-surfaceContainer p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h3 className="title-small text-onSurface">Asset Inventory</h3>
            <p className="body-small text-onSurfaceVariant">
              {assets.length} records • {selectedAssetIds.length} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={
                selectedAssetIds.length === 0 || !onOpenAllocationModal
              }
              onClick={() => onOpenAllocationModal?.()}
            >
              Allocate Selected
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={
                selectedAssetIds.length === 0 || !onOpenTransferModal
              }
              onClick={() => onOpenTransferModal?.()}
            >
              Transfer Selected
            </Button>
          </div>
        </div>
        <div className="flex-1 border-t border-outline">
          <AllocationTable
            variant="allocation"
            assets={assets}
            selectedAssetIds={selectedAssetIds}
            onSelectionChange={onSelectionChange}
            onInspectAsset={onInspectAsset}
          />
        </div>
      </Card>
    </div>
  );
};

export default AllocationTab;
