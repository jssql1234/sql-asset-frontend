import { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import Search from "@/components/Search";
import AllocationTable from "../AllocationTable";
import { getAllocationSummaryCards } from "../AllocationSummaryCards";
import type { AllocationSummary, AssetRecord } from "../../types";
import { filterAssetsByQuery } from "../../utils/filtering";

interface AllocationPageProps {
  assets: AssetRecord[];
  summary: AllocationSummary;
  onOpenAllocationModal?: () => void;
}

const AllocationPage: React.FC<AllocationPageProps> = ({
  assets,
  summary,
  onOpenAllocationModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter assets based on search query
  const filteredAssets = useMemo(
    () => filterAssetsByQuery(assets, searchQuery),
    [assets, searchQuery]
  );

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
            label: "Allocate",
            onAction: () => onOpenAllocationModal?.(),
            variant: "default",
          }
        ]}
      />

      <SummaryCards data={summaryCards} />

      <Search
        searchValue={searchQuery}
        searchPlaceholder="Search by asset, status, or location"
        onSearch={setSearchQuery}
        live
      />
        <div className="flex-1 border-t border-outline">
          <AllocationTable
            variant="allocation"
            assets={filteredAssets}
          />
        </div>
    </div>
  );
};

export default AllocationPage;
