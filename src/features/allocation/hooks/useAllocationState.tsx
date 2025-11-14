import { useCallback, useMemo, useState } from "react";
import { MOCK_ASSETS, MOCK_RENTALS } from "../mockData";
import type { AllocationActionPayload, AllocationSummary, AssetRecord, RentalPayload } from "../types";

export const useAllocationState = () => {
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const assets = MOCK_ASSETS;
  const rentals = MOCK_RENTALS;

  const summary: AllocationSummary = useMemo(
    () => buildAllocationSummary(assets),
    [assets]
  );

  const locations = useMemo(
    () => getUniqueSortedValues(assets, (asset) => asset.location),
    [assets]
  );

  const users = useMemo(
    () => getUniqueSortedValues(assets, (asset) => asset.user),
    [assets]
  );

  const openAllocationModal = useCallback(() => { setIsAllocationModalOpen(true); }, []);

  const closeAllocationModal = useCallback(() => { setIsAllocationModalOpen(false); }, []);

  const handleAllocationSubmit = useCallback((payload: AllocationActionPayload) => {
    console.info("Allocation submitted", payload);
    setIsAllocationModalOpen(false);
  }, []);

  const handleRentalSubmit = useCallback((payload: RentalPayload) => {
    console.info("Rental submitted", payload);
  }, []);

  return {
    assets,
    rentals,
    summary,
    locations,
    users,
    isAllocationModalOpen,
    openAllocationModal,
    closeAllocationModal,
    handleAllocationSubmit,
    handleRentalSubmit,
  };
};

const buildAllocationSummary = (assets: AssetRecord[]): AllocationSummary => {
  const totals = assets.reduce(
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
};

const getUniqueSortedValues = (
  assets: AssetRecord[],
  selector: (asset: AssetRecord) => string
) => {
  const values = new Set<string>();
  assets.forEach((asset) => {
    const value = selector(asset);
    if (value) {
      values.add(value);
    }
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b));
};