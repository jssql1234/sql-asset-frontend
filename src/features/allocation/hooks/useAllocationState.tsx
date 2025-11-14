import { useCallback, useMemo, useState } from "react";
import { MOCK_ASSETS, MOCK_RENTALS } from "../mockData";
import { parseDateLike } from "../utils/formatters";
import type { AllocationActionPayload, AllocationCalendarEvent, AllocationCalendarEventType, AllocationSummary, AssetRecord, RentalPayload, RentalRecord } from "../types";

export const useAllocationState = () => {
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [assets, setAssets] = useState<AssetRecord[]>(() => [...MOCK_ASSETS]);
  const [rentals, setRentals] = useState<RentalRecord[]>(() => [...MOCK_RENTALS]);
  const [calendarEvents, setCalendarEvents] = useState<AllocationCalendarEvent[]>([]);

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

  const handleAllocationSubmit = useCallback(
    (payload: AllocationActionPayload) => {
      if (payload.assets.length === 0) {
        return;
      }

      const selectionMap = new Map(
        payload.assets.map((selection) => [selection.assetId, selection])
      );

      const eventType: AllocationCalendarEventType =
        payload.type === "user" ? "user-assignment" : "location-allocation";

      const assetLookup = new Map(assets.map((asset) => [asset.id, asset]));

      setAssets((currentAssets) =>
        currentAssets.map((asset) => {
          const selection = selectionMap.get(asset.id);
          if (!selection) {
            return asset;
          }

          const requestedQuantity = Math.max(0, selection.requestedQuantity);
          const nextAllocated = Math.min(
            asset.total,
            asset.allocated + requestedQuantity
          );
          const nextRemaining = Math.max(0, asset.total - nextAllocated);
          const nextStatus: AssetRecord["status"] =
            nextRemaining === 0
              ? "Fully Booked"
              : nextAllocated > asset.allocated
                ? "In Use"
                : asset.status;

          return {
            ...asset,
            allocated: nextAllocated,
            remaining: nextRemaining,
            status: nextStatus,
            location:
              payload.type === "location" && payload.targetLocation
                ? payload.targetLocation
                : asset.location,
            user:
              payload.type === "user" && payload.targetUser
                ? payload.targetUser
                : asset.user,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      setCalendarEvents((currentEvents) => {
        const newEvents = payload.assets.map((selection) => {
          const asset = assetLookup.get(selection.assetId);
          return {
            id: createUniqueId("alloc"),
            title: asset ? `${asset.name} allocation` : selection.assetId,
            type: eventType,
            start: payload.startDate ?? new Date().toISOString(),
            end: payload.endDate,
            assetName: asset?.name ?? selection.assetId,
            assignee: payload.type === "user" ? payload.targetUser : undefined,
            location:
              payload.type === "location"
                ? payload.targetLocation
                : asset?.location,
          } satisfies AllocationCalendarEvent;
        });
        return [...currentEvents, ...newEvents];
      });
    },
    [assets]
  );

  const handleRentalSubmit = useCallback(
    (payload: RentalPayload) => {
      if (payload.assetIds.length === 0) {
        return;
      }

      const assetLookup = new Map(assets.map((asset) => [asset.id, asset]));
      const rentPerAsset =
        payload.assetIds.length > 0
          ? payload.rentAmount / payload.assetIds.length
          : payload.rentAmount;
      const start = parseDateLike(payload.startDate);
      const status: RentalRecord["status"] =
        start && start.getTime() <= Date.now() ? "Active" : "Scheduled";

      const newRentalRecords = payload.assetIds.map((assetId) => {
        const asset = assetLookup.get(assetId);
        return {
          id: createUniqueId("rental"),
          assetId,
          assetName: asset?.name ?? assetId,
          customerName: payload.customerName,
          location: asset?.location ?? "Unassigned",
          status,
          startDate: payload.startDate,
          endDate: payload.endDate,
          quantity: 1,
          rentAmount: rentPerAsset,
          rentPerUnit: rentPerAsset,
          notes: payload.notes,
        } satisfies RentalRecord;
      });

      setRentals((current) => [...newRentalRecords, ...current]);

      setAssets((currentAssets) =>
        currentAssets.map((asset) => {
          const occurrences = payload.assetIds.filter((id) => id === asset.id).length;
          if (occurrences === 0) {
            return asset;
          }

          const nextAllocated = Math.min(
            asset.total,
            asset.allocated + occurrences
          );
          const nextRemaining = Math.max(0, asset.total - nextAllocated);
          const nextStatus: AssetRecord["status"] =
            nextRemaining === 0
              ? "Fully Booked"
              : nextAllocated > asset.allocated
                ? "In Use"
                : asset.status;

          return {
            ...asset,
            allocated: nextAllocated,
            remaining: nextRemaining,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      setCalendarEvents((currentEvents) => {
        const rentalEvents: AllocationCalendarEvent[] = newRentalRecords.map(
          (record) => ({
            id: createUniqueId("rental-event"),
            title: `${record.customerName} rental`,
            type: status === "Active" ? "user-assignment" : "location-allocation",
            start: record.startDate,
            end: record.endDate,
            assetName: record.assetName,
            assignee: record.customerName,
            location: record.location,
          })
        );
        return [...currentEvents, ...rentalEvents];
      });
    },
    [assets]
  );

  return {
    assets,
    rentals,
    calendarEvents,
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

const createUniqueId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
};