import { useMemo } from "react";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import { AllocationFilter } from "../AllocationSearchFilter";
import AllocationTable from "../AllocationTable";
import { getAllocationSummaryCards } from "../AllocationSummaryCards";
import type { AllocationFilters, AllocationSummary, AssetRecord, AssetStatus } from "../../types";

interface AllocationTabProps {
  assets: AssetRecord[];
  filters: AllocationFilters;
  summary: AllocationSummary;
  locations: string[];
  pics: string[];
  statuses: AssetStatus[];
  onFilterChange: (filters: AllocationFilters) => void;
  onOpenAllocationModal?: () => void;
}

const AllocationTab: React.FC<AllocationTabProps> = ({
  assets,
  filters,
  summary,
  locations,
  pics,
  statuses,
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

      <AllocationFilter
        filters={filters}
        locations={locations}
        pics={pics}
        statuses={statuses}
        onFiltersChange={(partialFilters) =>
          onFilterChange({ ...filters, ...partialFilters })
        }
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
