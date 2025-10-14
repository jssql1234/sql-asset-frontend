import {
  type Meter,
  type MeterGroup,
  type MeterState,
  type MeterReading,
} from "@/types/meter";
import type { Asset } from "@/types/asset";
import { meterIdGenerator } from "@/utils/id";

const STORAGE_KEY = "sql-asset-meter-state";

const buildDefaultMeters = (): MeterGroup[] => {
  const runtimeHours: Meter = {
    id: meterIdGenerator(),
    uom: "hrs",
    conditions: [
      {
        id: meterIdGenerator(),
        conditionTarget: "cumulative",
        operator: ">=",
        value: 500,
        triggerAction: "work_order",
        triggerMode: "once",
      }
    ],
  };

  const temperature: Meter = {
    id: meterIdGenerator(),
    uom: "°C",
    conditions: [
      {
        id: meterIdGenerator(),
        conditionTarget: "absolute",
        operator: "<",
        value: 15,
        triggerAction: "notification",
        triggerMode: "every_time",
      },
      {
        id: meterIdGenerator(),
        conditionTarget: "absolute",
        operator: ">",
        value: 75,
        triggerAction: "notification",
        triggerMode: "every_time",
      }
    ],
  };

  const vibration: Meter = {
    id: meterIdGenerator(),
    uom: "mm/s",
    conditions: [
      {
        id: meterIdGenerator(),
        conditionTarget: "absolute",
        operator: ">",
        value: 8,
        triggerAction: "work_order",
        triggerMode: "once",
      }
    ],
  };

  const fuelLevel: Meter = {
    id: meterIdGenerator(),
    uom: "%",
    conditions: [
      {
        id: meterIdGenerator(),
        conditionTarget: "absolute",
        operator: "<",
        value: 10,
        triggerAction: "notification",
        triggerMode: "every_time",
      }
    ],
  };

  return [
    {
      id: meterIdGenerator(),
      name: "Plant Utilities",
      description:
        "Tracks the key utilities consumption and boundary violations across production lines.",
      meters: [runtimeHours, temperature, vibration],
      assignedAssets: [
        {
          id: "AST-1001",
          batchId: "BATCH-001",
          name: "Air Compressor 01",
          group: "Utilities",
          description: "Primary air compressor",
          acquireDate: "2023-01-15",
          purchaseDate: "2023-01-10",
          cost: 15000,
          qty: 1,
          active: true,
        },
        {
          id: "AST-1002",
          batchId: "BATCH-001",
          name: "Chiller 01",
          group: "HVAC",
          description: "Main cooling chiller",
          acquireDate: "2023-02-20",
          purchaseDate: "2023-02-15",
          cost: 25000,
          qty: 1,
          active: true,
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: meterIdGenerator(),
      name: "Mobility Fleet",
      description:
        "Monitors fuel and mileage readings for the logistics vehicle fleet.",
      meters: [
        {
          id: meterIdGenerator(),
          uom: "km",
          conditions: [],
        },
        fuelLevel,
      ],
      assignedAssets: [
        {
          id: "AST-1201",
          batchId: "BATCH-002",
          name: "Delivery Van 01",
          group: "Vehicles",
          description: "Primary delivery vehicle",
          acquireDate: "2023-03-10",
          purchaseDate: "2023-03-05",
          cost: 30000,
          qty: 1,
          active: true,
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ];
};

const buildDefaultAssets = (): Asset[] => [
  {
    id: "AST-1003",
    batchId: "BATCH-001",
    name: "Cooling Tower 01",
    group: "Utilities",
    description: "Roof cooling tower",
    acquireDate: "2023-01-20",
    purchaseDate: "2023-01-15",
    cost: 20000,
    qty: 1,
    active: true,
  },
  {
    id: "AST-1301",
    batchId: "BATCH-003",
    name: "Forklift 01",
    group: "Vehicles",
    description: "Warehouse forklift",
    acquireDate: "2023-04-10",
    purchaseDate: "2023-04-05",
    cost: 18000,
    qty: 1,
    active: true,
  },
];

const buildDefaultReadings = (groups: MeterGroup[]): MeterReading[] => {
  const readings: MeterReading[] = [];
  const plantUtilities = groups[0];
  const mobilityFleet = groups[1];

  if (plantUtilities) {
    const compressor = plantUtilities.assignedAssets[0];
    const runtimeMeter = plantUtilities.meters[0];
    const temperatureMeter = plantUtilities.meters[1];

    if (compressor && runtimeMeter && temperatureMeter) {
      readings.push(
        {
          id: meterIdGenerator(),
          groupId: plantUtilities.id,
          meterId: runtimeMeter.id,
          assetId: compressor.id,
          assetCode: compressor.id,
          assetName: compressor.name,
          recordedBy: "Administrator",
          recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          value: 6123,
          uom: runtimeMeter.uom,
          notes: "Quarterly preventive maintenance completed.",
        },
        {
          id: meterIdGenerator(),
          groupId: plantUtilities.id,
          meterId: temperatureMeter.id,
          assetId: compressor.id,
          assetCode: compressor.id,
          assetName: compressor.name,
          recordedBy: "Administrator",
          recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          value: 68,
          uom: temperatureMeter.uom,
          notes: "Stable temperature post-maintenance.",
        }
      );
    }
  }

  if (mobilityFleet) {
    const van = mobilityFleet.assignedAssets[0];
    const odometer = mobilityFleet.meters[0];
    const fuel = mobilityFleet.meters[1];

    if (van && odometer && fuel) {
      readings.push(
        {
          id: meterIdGenerator(),
          groupId: mobilityFleet.id,
          meterId: odometer.id,
          assetId: van.id,
          assetCode: van.id,
          assetName: van.name,
          recordedBy: "Administrator",
          recordedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          value: 43812,
          uom: odometer.uom,
          notes: "Delivery route completed.",
        },
        {
          id: meterIdGenerator(),
          groupId: mobilityFleet.id,
          meterId: fuel.id,
          assetId: van.id,
          assetCode: van.id,
          assetName: van.name,
          recordedBy: "Administrator",
          recordedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          value: 42,
          uom: fuel.uom,
          notes: "Topped up at central depot.",
        }
      );
    }
  }

  return readings;
};

const DEFAULT_STATE = (): MeterState => {
  const meterGroups = buildDefaultMeters();
  return {
    meterGroups,
    availableAssets: buildDefaultAssets(),
    readings: buildDefaultReadings(meterGroups),
    activeUser: "Administrator",
  };
};

const ensureAssetIndex = (state: MeterState): MeterState => {
  const assetMap = new Map<string, Asset>();
  state.availableAssets.forEach((asset) => assetMap.set(asset.id, asset));

  const patchedGroups = state.meterGroups.map((group) => {
    const patchedAssets = group.assignedAssets
      .map((asset) => {
        if (assetMap.has(asset.id)) return assetMap.get(asset.id)!;
        return null;
      })
      .filter((asset): asset is Asset => Boolean(asset));

    return {
      ...group,
      assignedAssets: patchedAssets,
    };
  });

  return {
    ...state,
    meterGroups: patchedGroups,
  };
};

export const loadMeterState = (): MeterState => {
  if (typeof window === "undefined") return DEFAULT_STATE();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const fresh = DEFAULT_STATE();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(stored) as MeterState;
    return ensureAssetIndex({ ...DEFAULT_STATE(), ...parsed });
  } catch (error) {
    console.warn("Failed to read meter state from storage", error);
    const fallback = DEFAULT_STATE();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    }
    return fallback;
  }
};

export const persistMeterState = (state: MeterState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist meter state", error);
  }
};

export const resetMeterState = (): MeterState => {
  const fresh = DEFAULT_STATE();
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  }
  return fresh;
};
