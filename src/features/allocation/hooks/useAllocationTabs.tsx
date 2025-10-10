import AllocationTab from "../components/tab/AllocationTab";
import RentalsTab from "../components/tab/RentalsTab";
import CalendarTab from "../components/tab/CalendarTab";
import type { AllocationSummary, AssetRecord } from "../types";

interface UseAllocationTabsProps {
  filteredAssets: AssetRecord[];
  summary: AllocationSummary;
  onOpenAllocationModal: () => void;
}

export const getAllocationTabs = ({
  filteredAssets,
  summary,
  onOpenAllocationModal,
}: UseAllocationTabsProps) => {
  const tabs = [
    {
      value: "allocation",
      label: "Allocation",
      content: (
        <AllocationTab
          assets={filteredAssets}
          summary={summary}
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