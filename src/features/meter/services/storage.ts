import {
  type Asset,
  type Meter,
  type MeterGroup,
  type MeterState,
  type MeterReading,
} from "../../../types/meter";
import { meterIdGenerator } from "@/utils/id";

const STORAGE_KEY = "sql-asset-meter-state";

const buildDefaultMeters = (): MeterGroup[] => {
  const runtimeHours: Meter = {
    id: meterIdGenerator(),
    name: "Runtime Hours",
    unit: "hrs",
    type: "counter",
    lowerBoundary: 0,
    notesPlaceholder: "Any anomalies observed during inspection",
  };

  const temperature: Meter = {
    id: meterIdGenerator(),
    name: "Coolant Temperature",
    unit: "°C",
    type: "numeric",
    lowerBoundary: 15,
    upperBoundary: 75,
  };

  const vibration: Meter = {
    id: meterIdGenerator(),
    name: "Vibration Level",
    unit: "mm/s",
    type: "numeric",
    upperBoundary: 8,
  };

  const fuelLevel: Meter = {
    id: meterIdGenerator(),
    name: "Fuel Level",
    unit: "%",
    type: "numeric",
    lowerBoundary: 10,
    upperBoundary: 100,
  };

  return [
    {
      id: meterIdGenerator(),
      name: "Plant Utilities",
      description:
        "Tracks the key utilities consumption and boundary violations across production lines.",
      boundaryTrigger: "both",
      meters: [runtimeHours, temperature, vibration],
      assignedAssets: [
        {
          id: "AST-1001",
          code: "AST-1001",
          name: "Air Compressor 01",
          category: "Utilities",
        },
        {
          id: "AST-1002",
          code: "AST-1002",
          name: "Chiller 01",
          category: "HVAC",
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: meterIdGenerator(),
      name: "Mobility Fleet",
      description:
        "Monitors fuel and mileage readings for the logistics vehicle fleet.",
      boundaryTrigger: "lower",
      meters: [
        {
          id: meterIdGenerator(),
          name: "Odometer",
          unit: "km",
          type: "counter",
          lowerBoundary: 0,
        },
        fuelLevel,
      ],
      assignedAssets: [
        {
          id: "AST-1201",
          code: "AST-1201",
          name: "Delivery Van 01",
          category: "Vehicles",
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ];
};

const buildDefaultAssets = (): Asset[] => [
  {
    id: "AST-1001",
    code: "AST-1001",
    name: "Air Compressor 01",
    category: "Utilities",
    location: "Plant Room",
    status: "assigned",
  },
  {
    id: "AST-1002",
    code: "AST-1002",
    name: "Chiller 01",
    category: "HVAC",
    location: "Plant Room",
    status: "assigned",
  },
  {
    id: "AST-1003",
    code: "AST-1003",
    name: "Cooling Tower 01",
    category: "Utilities",
    location: "Roof Deck",
    status: "available",
  },
  {
    id: "AST-1201",
    code: "AST-1201",
    name: "Delivery Van 01",
    category: "Vehicles",
    location: "Garage",
    status: "assigned",
  },
  {
    id: "AST-1301",
    code: "AST-1301",
    name: "Forklift 01",
    category: "Vehicles",
    location: "Warehouse",
    status: "available",
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
          assetCode: compressor.code,
          assetName: compressor.name,
          recordedBy: "Administrator",
          recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
          value: 6123,
          unit: runtimeMeter.unit,
          notes: "Quarterly preventive maintenance completed.",
        },
        {
          id: meterIdGenerator(),
          groupId: plantUtilities.id,
          meterId: temperatureMeter.id,
          assetId: compressor.id,
          assetCode: compressor.code,
          assetName: compressor.name,
          recordedBy: "Administrator",
          recordedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          value: 68,
          unit: temperatureMeter.unit,
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
          assetCode: van.code,
          assetName: van.name,
          recordedBy: "Administrator",
          recordedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          value: 43812,
          unit: odometer.unit,
          notes: "Delivery route completed.",
        },
        {
          id: meterIdGenerator(),
          groupId: mobilityFleet.id,
          meterId: fuel.id,
          assetId: van.id,
          assetCode: van.code,
          assetName: van.name,
          recordedBy: "Administrator",
          recordedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          value: 42,
          unit: fuel.unit,
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
