import { useCallback, useEffect, useMemo, useState } from "react";
import { MOCK_ASSETS, MOCK_LOCATIONS, MOCK_PICS, MOCK_STATUS } from "../mockData";
import type { AllocationActionPayload, AllocationFilters, AllocationSummary, AssetRecord } from "../types";

const DEFAULT_FILTERS: AllocationFilters = {
  search: "",
  location: "",
  pic: "",
  status: "",
};

export const useAllocationState = () => {
  const [filters, setFilters] = useState<AllocationFilters>(DEFAULT_FILTERS);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

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

  const handleFilterChange = useCallback((nextFilters: AllocationFilters) => {
    setFilters(nextFilters);
  }, []);

  const handleSelectionChange = useCallback((selected: AssetRecord[]) => {
    setSelectedAssetIds(selected.map((asset) => asset.id));
  }, []);

  const openAllocationModal = useCallback(() => setIsAllocationModalOpen(true), []);
  const openTransferModal = useCallback(() => setIsTransferModalOpen(true), []);
  const openReturnModal = useCallback(() => setIsReturnModalOpen(true), []);

  const closeAllocationModal = useCallback(() => setIsAllocationModalOpen(false), []);
  const closeTransferModal = useCallback(() => setIsTransferModalOpen(false), []);
  const closeReturnModal = useCallback(() => setIsReturnModalOpen(false), []);

  const handleAllocationSubmit = useCallback((_payload: AllocationActionPayload) => {
    setIsAllocationModalOpen(false);
  }, []);

  return {
    filters,
    selectedAssetIds,
    filteredAssets,
    summary,
    isAllocationModalOpen,
    isTransferModalOpen,
    isReturnModalOpen,
    locations: MOCK_LOCATIONS,
    pics: MOCK_PICS,
    statuses: MOCK_STATUS,
    assets: MOCK_ASSETS,
    handleFilterChange,
    handleSelectionChange,
    openAllocationModal,
    openTransferModal,
    openReturnModal,
    closeAllocationModal,
    closeTransferModal,
    closeReturnModal,
    handleAllocationSubmit,
  };
};