import { useCallback, useEffect, useMemo, useState } from "react";
import { meterIdGenerator } from "@/utils/id";
import {
  type BoundaryTrigger,
  type Meter,
  type MeterAssignmentStrategy,
  type MeterGroup,
  type MeterGroupInput,
  type MeterReading,
  type MeterReadingDraft,
  type MeterState,
} from "../../../types/meter";
import type { Asset } from "@/types/asset";
import {
  loadMeterState,
  persistMeterState,
  resetMeterState,
} from "../services/storage";

interface RemoveMeterOptions {
  deleteReadings?: boolean;
}

interface SaveReadingsPayload {
  groupId: string;
  assetId: string;
  entries: MeterReadingDraft[];
}

const buildMeterLookup = (groups: MeterGroup[]) => {
  const meterMap = new Map<string, { meter: Meter; group: MeterGroup }>();
  groups.forEach((group) => {
    group.meters.forEach((meter) => {
      meterMap.set(meter.id, { meter, group });
    });
  });
  return meterMap;
};

export const useMeterManagement = () => {
  const [state, setState] = useState<MeterState>(() => loadMeterState());

  useEffect(() => {
    persistMeterState(state);
  }, [state]);

  const meterLookup = useMemo(
    () => buildMeterLookup(state.meterGroups),
    [state.meterGroups]
  );

  const assetLookup = useMemo(() => {
    const map = new Map<string, Asset>();
    state.availableAssets.forEach((asset) => map.set(asset.id, asset));
    state.meterGroups.forEach((group) => {
      group.assignedAssets.forEach((asset) => map.set(asset.id, asset));
    });
    return map;
  }, [state.availableAssets, state.meterGroups]);

  const getGroupById = useCallback(
    (groupId: string) => state.meterGroups.find((group) => group.id === groupId),
    [state.meterGroups]
  );

  const getMetersByGroupId = useCallback(
    (groupId: string) => getGroupById(groupId)?.meters ?? [],
    [getGroupById]
  );

  const getAssetsByGroupId = useCallback(
    (groupId: string) => getGroupById(groupId)?.assignedAssets ?? [],
    [getGroupById]
  );

  const getReadingsByAssetId = useCallback(
    (assetId: string) =>
      state.readings
        .filter((reading) => reading.assetId === assetId)
        .sort(
          (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        ),
    [state.readings]
  );

  const getReadingSummaryByMeterId = useCallback(
    (meterId: string, assetId?: string) => {
      const records = state.readings
        .filter((reading) => reading.meterId === meterId)
        .filter((reading) => (assetId ? reading.assetId === assetId : true))
        .sort(
          (a, b) =>
            new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
        );
      return records[0];
    },
    [state.readings]
  );

  const createGroup = useCallback(
    (input: MeterGroupInput) => {
      const now = new Date().toISOString();
      const group: MeterGroup = {
        id: meterIdGenerator("group"),
        name: input.name,
        description: input.description,
        boundaryTrigger: input.boundaryTrigger,
        meters: [],
        assignedAssets: [],
        createdAt: now,
      };

      setState((prev) => ({
        ...prev,
        meterGroups: [group, ...prev.meterGroups],
      }));

      return group;
    },
    []
  );

  const updateGroup = useCallback(
    (groupId: string, update: Partial<MeterGroupInput>) => {
      setState((prev) => ({
        ...prev,
        meterGroups: prev.meterGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                name: update.name ?? group.name,
                description: update.description ?? group.description,
                boundaryTrigger:
                  (update.boundaryTrigger as BoundaryTrigger | undefined) ??
                  group.boundaryTrigger,
                updatedAt: new Date().toISOString(),
              }
            : group
        ),
      }));
    },
    []
  );

  const deleteGroup = useCallback((groupId: string) => {
    setState((prev) => ({
      ...prev,
      meterGroups: prev.meterGroups.filter((group) => group.id !== groupId),
      readings: prev.readings.filter((reading) => reading.groupId !== groupId),
    }));
  }, []);

  const cloneGroup = useCallback((groupId: string) => {
    setState((prev) => {
      const original = prev.meterGroups.find((group) => group.id === groupId);
      if (!original) return prev;

      const now = new Date().toISOString();
      const clonedMeters = original.meters.map((meter) => ({
        ...meter,
        id: meterIdGenerator("meter"),
      }));

      const cloned: MeterGroup = {
        ...original,
        id: meterIdGenerator("group"),
        name: `${original.name} (Copy)`,
        meters: clonedMeters,
        assignedAssets: [],
        createdAt: now,
        updatedAt: undefined,
      };

      return {
        ...prev,
        meterGroups: [cloned, ...prev.meterGroups],
      };
    });
  }, []);

  const addMeterToGroup = useCallback(
    (groupId: string, Meter: Meter) => {
      const meter: Meter = {
        id: meterIdGenerator("meter"),
        uom: Meter.uom,
        conditions: Meter.conditions,
      };

      setState((prev) => ({
        ...prev,
        meterGroups: prev.meterGroups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                meters: [...group.meters, meter],
                updatedAt: new Date().toISOString(),
              }
            : group
        ),
      }));

      return meter;
    },
    []
  );

  const updateMeter = useCallback(
    (groupId: string, meterId: string, input: Partial<Meter>) => {
      setState((prev) => ({
        ...prev,
        meterGroups: prev.meterGroups.map((group) => {
          if (group.id !== groupId) return group;
          return {
            ...group,
            meters: group.meters.map((meter) =>
              meter.id === meterId
                ? {
                    ...meter,
                    uom: input.uom ?? meter.uom,
                    conditions:
                      input.conditions !== undefined
                        ? input.conditions
                        : meter.conditions,
                  }
                : meter
            ),
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    []
  );

  const removeMeter = useCallback(
    (groupId: string, meterId: string, options?: RemoveMeterOptions) => {
      setState((prev) => {
        const deleteReadings = options?.deleteReadings ?? false;

        return {
          ...prev,
          meterGroups: prev.meterGroups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  meters: group.meters.filter((meter) => meter.id !== meterId),
                  updatedAt: new Date().toISOString(),
                }
              : group
          ),
          readings: deleteReadings
            ? prev.readings.filter((reading) => reading.meterId !== meterId)
            : prev.readings.map((reading) =>
                reading.meterId === meterId
                  ? { ...reading, meterDeleted: true }
                  : reading
              ),
        };
      });
    },
    []
  );

  const assignAssetsToGroup = useCallback(
    (
      groupId: string,
      assetIds: string[],
      strategy: MeterAssignmentStrategy = "move"
    ) => {
      setState((prev) => {
        const uniqueAssetIds = Array.from(new Set(assetIds));
        const assetsToAssign = uniqueAssetIds
          .map((assetId) => assetLookup.get(assetId))
          .filter((asset): asset is Asset => Boolean(asset));

        const nextGroups = prev.meterGroups.map((group) => {
          if (group.id === groupId) {
            const existingIds = new Set(group.assignedAssets.map((a) => a.id));
            const mergedAssets = assetsToAssign.filter(
              (asset) => !existingIds.has(asset.id)
            );

            return {
              ...group,
              assignedAssets: [...group.assignedAssets, ...mergedAssets],
              updatedAt: new Date().toISOString(),
            };
          }

          if (strategy === "move") {
            return {
              ...group,
              assignedAssets: group.assignedAssets.filter(
                (asset) => !uniqueAssetIds.includes(asset.id)
              ),
            };
          }

          return group;
        });

        return {
          ...prev,
          meterGroups: nextGroups,
        };
      });
    },
    [assetLookup]
  );

  const removeAssetFromGroup = useCallback((groupId: string, assetId: string) => {
    setState((prev) => ({
      ...prev,
      meterGroups: prev.meterGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              assignedAssets: group.assignedAssets.filter(
                (asset) => asset.id !== assetId
              ),
              updatedAt: new Date().toISOString(),
            }
          : group
      ),
    }));
  }, []);

  const saveReadings = useCallback(
    ({ groupId, assetId, entries }: SaveReadingsPayload) => {
      const group = getGroupById(groupId);
      if (!group) throw new Error("Group not found");

      const asset = group.assignedAssets.find((a) => a.id === assetId);
      if (!asset) throw new Error("Asset is not assigned to group");

      const newReadings = entries.reduce<MeterReading[]>((acc, entry) => {
        const meter = group.meters.find((m) => m.id === entry.meterId);
        if (!meter) return acc;

        acc.push({
          id: meterIdGenerator("reading"),
          groupId,
          meterId: meter.id,
          assetId: asset.id,
          assetCode: asset.id,
          assetName: asset.name,
          recordedBy: state.activeUser,
          recordedAt: new Date().toISOString(),
          value: entry.value,
          notes: entry.notes ?? undefined,
          uom: meter.uom,
        });

        return acc;
      }, []);

      if (newReadings.length === 0) return;

      setState((prev) => ({
        ...prev,
        readings: [...newReadings, ...prev.readings],
      }));
    },
    [getGroupById, state.activeUser]
  );

  const deleteReading = useCallback((readingId: string) => {
    setState((prev) => ({
      ...prev,
      readings: prev.readings.filter((reading) => reading.id !== readingId),
    }));
  }, []);

  const setActiveUser = useCallback((user: string) => {
    setState((prev) => ({
      ...prev,
      activeUser: user,
    }));
  }, []);

  const reset = useCallback(() => {
    const fresh = resetMeterState();
    setState(fresh);
  }, []);

  return {
    meterGroups: state.meterGroups,
    availableAssets: state.availableAssets,
    readings: state.readings,
    activeUser: state.activeUser,
    meterLookup,
    assetLookup,
    createGroup,
    updateGroup,
    deleteGroup,
    cloneGroup,
    addMeterToGroup,
    updateMeter,
    removeMeter,
    assignAssetsToGroup,
    removeAssetFromGroup,
    saveReadings,
    deleteReading,
    setActiveUser,
    reset,
    getGroupById,
    getMetersByGroupId,
    getAssetsByGroupId,
    getReadingsByAssetId,
    getReadingSummaryByMeterId,
  };
};
