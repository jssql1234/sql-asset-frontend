import { useEffect, useMemo, useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import Tabs from "@/components/ui/components/Tabs";
import AllocationTab from "../components/AllocationTab";
import CalendarTab from "../components/CalendarTab";
import RentalsTab from "../components/RentalsTab";
import AllocationModal from "../components/modal/AllocationModal";
import TransferModal from "../components/modal/TransferModal";
import ReturnModal from "../components/modal/ReturnModal";
import { MOCK_ASSETS, MOCK_LOCATIONS, MOCK_PICS, MOCK_STATUS } from "../mockData";
import type { AllocationActionPayload, AllocationFilters, AllocationSummary, AssetRecord,} from "../types";

const DEFAULT_FILTERS: AllocationFilters = {
  search: "",
  location: "",
  pic: "",
  status: "",
};

const AssetAllocationPage: React.FC = () => {
  const [filters, setFilters] = useState<AllocationFilters>(DEFAULT_FILTERS);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const filterOptions = useMemo(
    () => ({
      locations: MOCK_LOCATIONS,
      pics: MOCK_PICS,
      statuses: MOCK_STATUS,
    }),
    []
  );

  const filteredAssets = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return MOCK_ASSETS.filter((asset) => {
      const matchesSearch = normalizedSearch
        ? `${asset.name} ${asset.code} ${asset.status} ${asset.location}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesLocation = filters.location
        ? asset.location === filters.location
        : true;
      const matchesPic = filters.pic ? asset.pic === filters.pic : true;
      const matchesStatus = filters.status
        ? asset.status === filters.status
        : true;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesPic &&
        matchesStatus
      );
    });
  }, [filters]);

  useEffect(() => {
    setSelectedAssetIds((prev) =>
      prev.filter((id) => filteredAssets.some((asset) => asset.id === id))
    );
  }, [filteredAssets]);

  const summary: AllocationSummary = useMemo(() => {
    const totals = filteredAssets.reduce(
      (acc, asset) => {
        acc.total += asset.total;
        acc.allocated += asset.allocated;
        acc.available += asset.remaining;
        return acc;
      },
      { total: 0, allocated: 0, available: 0 }
    );

    const utilization = totals.total
      ? Number(((totals.allocated / totals.total) * 100).toFixed(1))
      : 0;

    return {
      totalAssets: totals.total,
      allocatedAssets: totals.allocated,
      availableAssets: totals.available,
      utilizationRate: utilization,
    };
  }, [filteredAssets]);

  const handleFilterChange = (nextFilters: AllocationFilters) => {
    setFilters(nextFilters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleSelectionChange = (selected: AssetRecord[]) => {
    setSelectedAssetIds(selected.map((asset) => asset.id));
  };

  const openAllocationModal = () => setIsAllocationModalOpen(true);
  const openTransferModal = () => setIsTransferModalOpen(true);
  const openReturnModal = () => setIsReturnModalOpen(true);

  const closeAllocationModal = () => setIsAllocationModalOpen(false);
  const closeTransferModal = () => setIsTransferModalOpen(false);
  const closeReturnModal = () => setIsReturnModalOpen(false);

  const handleAllocationSubmit = (_payload: AllocationActionPayload) => {
    setIsAllocationModalOpen(false);
  };

  const tabs = [
    {
      value: "allocation",
      label: "Allocation",
      content: (
        <AllocationTab
          assets={filteredAssets}
          filters={filters}
          summary={summary}
          filterOptions={filterOptions}
          selectedAssetIds={selectedAssetIds}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onSelectionChange={handleSelectionChange}
          onOpenAllocationModal={openAllocationModal}
          onOpenTransferModal={openTransferModal}
          onOpenReturnModal={openReturnModal}
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

  return (
    <AssetLayout activeSidebarItem="allocation">
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <Tabs tabs={tabs} defaultValue="allocation" scrollable />
      </div>

      <AllocationModal
        isOpen={isAllocationModalOpen}
        onClose={closeAllocationModal}
        onSubmit={handleAllocationSubmit}
        assets={MOCK_ASSETS}
        selectedAssetIds={selectedAssetIds}
        locations={MOCK_LOCATIONS}
        users={MOCK_PICS}
      />
      <TransferModal isOpen={isTransferModalOpen} onClose={closeTransferModal} />
      <ReturnModal isOpen={isReturnModalOpen} onClose={closeReturnModal} />
    </AssetLayout>
  );
};

export default AssetAllocationPage;
