import { useMemo } from "react";
import { Button, Card } from "@/components/ui/components";
import SummaryCards from "@/components/SummaryCards";
import AssetFilters, { type FilterOptions } from "./AssetFilters";
import AssetTable from "./AssetTable";
import type {
  AllocationFilters,
  AllocationSummary,
  AssetRecord,
} from "../types";

interface AllocationTabProps {
  assets: AssetRecord[];
  filters: AllocationFilters;
  summary: AllocationSummary;
  filterOptions: FilterOptions;
  selectedAssetIds: string[];
  onFilterChange: (filters: AllocationFilters) => void;
  onResetFilters: () => void;
  onSelectionChange: (assets: AssetRecord[]) => void;
  onOpenAllocationModal: () => void;
  onOpenTransferModal: () => void;
  onOpenReturnModal: () => void;
  onInspectAsset: (asset: AssetRecord) => void;
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
    () => [
      {
        label: "Total Asset Quantity",
        value: summary.totalAssets.toLocaleString(),
        description: "Across all categories",
      },
      {
        label: "Utilised Quantity",
        value: summary.allocatedAssets.toLocaleString(),
        description: "Currently assigned",
        tone: "warning" as const,
      },
      {
        label: "Available Quantity",
        value: summary.availableAssets.toLocaleString(),
        description: "Ready for deployment",
        tone: "success" as const,
      },
      {
        label: "Utilization Rate",
        value: `${summary.utilizationRate}%`,
        description: "Allocation efficiency",
        tone: (summary.utilizationRate > 75 ? "warning" : "default") as
          | "warning"
          | "default",
      },
    ],
    [summary]
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex flex-col gap-3 rounded-xl border border-outline bg-surface p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="title-large text-onSurface">Asset Allocation</h2>
          <p className="body-medium text-onSurfaceVariant">
            Monitor allocation status, utilization, and perform bulk actions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onOpenReturnModal}>
            Bulk Return
          </Button>
          <Button variant="outline" size="sm" onClick={onOpenTransferModal}>
            Bulk Transfer
          </Button>
          <Button size="sm" onClick={onOpenAllocationModal}>
            Bulk Allocation
          </Button>
        </div>
      </header>

      <SummaryCards data={summaryCards} />

      <AssetFilters
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
              disabled={selectedAssetIds.length === 0}
              onClick={onOpenAllocationModal}
            >
              Allocate Selected
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={selectedAssetIds.length === 0}
              onClick={onOpenTransferModal}
            >
              Transfer Selected
            </Button>
          </div>
        </div>
        <div className="flex-1 border-t border-outline">
          <AssetTable
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
