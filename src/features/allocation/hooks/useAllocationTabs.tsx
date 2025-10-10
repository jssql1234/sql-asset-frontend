import AllocationTab from "../components/tab/AllocationTab";
import RentalsTab from "../components/tab/RentalsTab";
import CalendarTab from "../components/tab/CalendarTab";
import type { AllocationFilters, AllocationSummary, AssetRecord } from "../types";

interface UseAllocationTabsProps {
  filteredAssets: AssetRecord[];
  filters: AllocationFilters;
  summary: AllocationSummary;
  onFilterChange: (filters: AllocationFilters) => void;
  onOpenAllocationModal: () => void;
}

export const useAllocationTabs = ({
  filteredAssets,
  filters,
  summary,
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