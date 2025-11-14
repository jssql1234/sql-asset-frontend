import { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import AllocationTable from "../components/AllocationTable";
import { getAllocationSummaryCards } from "../components/AllocationSummaryCards";
import AddAllocationModal from "../components/AddAllocationModal";
import type { AllocationSummary, AssetRecord, AllocationActionPayload } from "../types";

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

      <div className="flex-1">
        <AllocationTable
          variant="allocation"
          assets={assets}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchPlaceholder="Search by asset, status, or location"
        />
      </div>

      <AddAllocationModal
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
