import { useMemo } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import Search from "@/components/Search";
import AllocationTable from "../AllocationTable";
import { getAllocationSummaryCards } from "../AllocationSummaryCards";
import type { AllocationFilters, AllocationSummary, AssetRecord } from "../../types";

interface AllocationTabProps {
  assets: AssetRecord[];
  filters: AllocationFilters;
  summary: AllocationSummary;
  onFilterChange: (filters: AllocationFilters) => void;
  onOpenAllocationModal?: () => void;
}

const AllocationTab: React.FC<AllocationTabProps> = ({
  assets,
  filters,
  summary,
  onFilterChange,
  onOpenAllocationModal,
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
            label: "New Allocation",
            onAction: () => onOpenAllocationModal?.(),
            variant: "default",
          }
        ]}
      />

      <SummaryCards data={summaryCards} />

      <Search
        searchValue={filters.search}
        searchPlaceholder="Search by asset, status, or location"
        onSearch={(value) => onFilterChange({ ...filters, search: value })}
        live
      />
        <div className="flex-1 border-t border-outline">
          <AllocationTable
            variant="allocation"
            assets={assets}
          />
        </div>
    </div>
  );
};

export default AllocationTab;
