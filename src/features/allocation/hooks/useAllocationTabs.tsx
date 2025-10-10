import AllocationTab from "../components/tab/AllocationTab";
import RentalsTab from "../components/tab/RentalsTab";
import CalendarTab from "../components/tab/CalendarTab";
import type { AllocationFilters, AllocationSummary, AssetRecord, AssetStatus } from "../types";

interface UseAllocationTabsProps {
  filteredAssets: AssetRecord[];
  filters: AllocationFilters;
  summary: AllocationSummary;
  locations: string[];
  pics: string[];
  statuses: AssetStatus[];
  onFilterChange: (filters: AllocationFilters) => void;
  onOpenAllocationModal: () => void;
}

export const useAllocationTabs = ({
  filteredAssets,
  filters,
  summary,
  locations,
  pics,
  statuses,
  onFilterChange,
  onOpenAllocationModal,
}: UseAllocationTabsProps) => {
  const tabs = [
    {
      value: "allocation",
      label: "Allocation",
      content: (
        <AllocationTab
          assets={filteredAssets}
          filters={filters}
          summary={summary}
          locations={locations}
          pics={pics}
          statuses={statuses}
          onFilterChange={onFilterChange}
          onOpenAllocationModal={onOpenAllocationModal}
        />
      ),
    },
    {
      value: "rentals",
      label: "Rentals",
      content: <RentalsTab />,
    },
    {
      value: "calendar",
      label: "Calendar",
      content: <CalendarTab />,
    },
  ];

  return tabs;
};