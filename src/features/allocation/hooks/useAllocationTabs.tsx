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
  selectedAssetIds: string[];
  onFilterChange: (filters: AllocationFilters) => void;
  onSelectionChange: (selected: AssetRecord[]) => void;
  onOpenAllocationModal: () => void;
  onOpenTransferModal: () => void;
  onOpenReturnModal: () => void;
}

export const useAllocationTabs = ({
  filteredAssets,
  filters,
  summary,
  locations,
  pics,
  statuses,
  selectedAssetIds,
  onFilterChange,
  onSelectionChange,
  onOpenAllocationModal,
  onOpenTransferModal,
  onOpenReturnModal,
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
          selectedAssetIds={selectedAssetIds}
          onFilterChange={onFilterChange}
          onSelectionChange={onSelectionChange}
          onOpenAllocationModal={onOpenAllocationModal}
          onOpenTransferModal={onOpenTransferModal}
          onOpenReturnModal={onOpenReturnModal}
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