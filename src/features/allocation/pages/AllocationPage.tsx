import { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import Search from "@/components/Search";
import AllocationTable from "../components/AllocationTable";
import { getAllocationSummaryCards } from "../components/AllocationSummaryCards";
import AllocationModal from "../components/AllocationModal";
import type { AllocationSummary, AssetRecord, AllocationActionPayload } from "../types";
import { filterAssetsByQuery } from "../utils/filtering";

interface AllocationPageProps {
  assets: AssetRecord[];
  summary: AllocationSummary;
  locations: string[];
  users: string[];
  isAllocationModalOpen: boolean;
  onOpenAllocationModal: () => void;
  onCloseAllocationModal: () => void;
  onAllocationSubmit: (payload: AllocationActionPayload) => void;
}

const AllocationPage: React.FC<AllocationPageProps> = ({
  assets,
  summary,
  locations,
  users,
  isAllocationModalOpen,
  onOpenAllocationModal,
  onCloseAllocationModal,
  onAllocationSubmit,
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
            onAction: onOpenAllocationModal,
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

      <AllocationModal
        isOpen={isAllocationModalOpen}
        onClose={onCloseAllocationModal}
        onSubmit={onAllocationSubmit}
        assets={assets}
        locations={locations}
        users={users}
      />
    </div>
  );
};

export default AllocationPage;
