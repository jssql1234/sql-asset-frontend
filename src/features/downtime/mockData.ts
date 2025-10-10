export const downtimeAssets: { id: string; name: string }[] = [
  { id: "CBT-001", name: "Conveyor Belt A1" },
  { id: "PMP-002", name: "Pump System B2" },
  { id: "GEN-003", name: "Generator C3" },
  { id: "AC-004", name: "Air Compressor D4" },
  { id: "HP-005", name: "Hydraulic Press E5" },
  { id: "CS-006", name: "Cooling System F6" },
];

export const downtimeAssetMap: Record<string, string> = downtimeAssets.reduce<Record<string, string>>(
  (acc, { id, name }) => {
    acc[id] = name;
    return acc;
  },
  {}
);

export const getDowntimeAssetName = (assetId: string): string =>
  downtimeAssetMap[assetId] ?? "Unknown Asset";