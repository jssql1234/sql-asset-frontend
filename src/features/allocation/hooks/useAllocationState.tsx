import { useCallback, useMemo, useState } from "react";
import { MOCK_ASSETS } from "../mockData";
import type { AllocationActionPayload, AllocationSummary } from "../types";

export const useAllocationState = () => {
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);

  const summary: AllocationSummary = useMemo(() => {
    const totals = MOCK_ASSETS.reduce(
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
  }, []);

  const openAllocationModal = useCallback(() => { setIsAllocationModalOpen(true); }, []);

  const closeAllocationModal = useCallback(() => { setIsAllocationModalOpen(false); }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAllocationSubmit = useCallback((_payload: AllocationActionPayload) => {
    setIsAllocationModalOpen(false);
  }, []);

  return {
    filteredAssets: MOCK_ASSETS,
    summary,
    isAllocationModalOpen,
    assets: MOCK_ASSETS,
    openAllocationModal,
    closeAllocationModal,
    handleAllocationSubmit,
  };
};