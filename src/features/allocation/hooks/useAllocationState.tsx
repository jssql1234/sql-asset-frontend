import { useCallback, useMemo, useState } from "react";
import { MOCK_ASSETS } from "../mockData";
import type { AllocationActionPayload, AllocationFilters, AllocationSummary } from "../types";

const DEFAULT_FILTERS: AllocationFilters = {
  search: "",
};

export const useAllocationState = () => {
  const [filters, setFilters] = useState<AllocationFilters>(DEFAULT_FILTERS);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return MOCK_ASSETS.filter((asset) => {
      return normalizedSearch
        ? `${asset.name} ${asset.code} ${asset.status} ${asset.location}`
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
    });
  }, [filters.search]);

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

  const openAllocationModal = useCallback(() => setIsAllocationModalOpen(true), []);

  const closeAllocationModal = useCallback(() => setIsAllocationModalOpen(false), []);

  const handleAllocationSubmit = useCallback((_payload: AllocationActionPayload) => {
    setIsAllocationModalOpen(false);
  }, []);

  return {
    filters,
    filteredAssets,
    summary,
    isAllocationModalOpen,
    assets: MOCK_ASSETS,
    handleFilterChange,
    openAllocationModal,
    closeAllocationModal,
    handleAllocationSubmit,
  };
};