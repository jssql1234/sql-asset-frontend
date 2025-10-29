export interface DowntimeAssetGroup {
  id: string;
  label: string;
  assets: {
    id: string;
    name: string;
    location?: string;
  }[];
}

export interface DowntimeAsset {
  id: string;
  name: string;
  groupId: string;
  groupLabel: string;
  location?: string;
}

export const downtimeAssetGroups: DowntimeAssetGroup[] = [
  {
    id: "assembly-line",
    label: "Assembly Line",
    assets: [
      { id: "CBT-001", name: "Conveyor Belt A1", location: "Zone A - Conveyor" },
      { id: "PMP-002", name: "Pump System B2", location: "Zone B - Fluids" },
    ],
  },
  {
    id: "power-systems",
    label: "Power Systems",
    assets: [
      { id: "GEN-003", name: "Generator C3", location: "Backup Power Wing" },
      { id: "AC-004", name: "Air Compressor D4", location: "Compressor Room" },
    ],
  },
  {
    id: "support-equipment",
    label: "Support Equipment",
    assets: [
      { id: "HP-005", name: "Hydraulic Press E5", location: "Fabrication Area" },
      { id: "CS-006", name: "Cooling System F6", location: "Thermal Control" },
    ],
  },
];

export const downtimeAssets: DowntimeAsset[] = downtimeAssetGroups.flatMap((group) =>
  group.assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    location: asset.location,
    groupId: group.id,
    groupLabel: group.label,
  }))
);

export const downtimeAssetMap: Partial<Record<string, DowntimeAsset>> = downtimeAssets.reduce<
  Partial<Record<string, DowntimeAsset>>
>((acc, asset) => {
  acc[asset.id] = asset;
  return acc;
}, {});

export const getDowntimeAssetInfo = (assetId: string): DowntimeAsset | undefined =>
  downtimeAssetMap[assetId];

export const getDowntimeAssetName = (assetId: string): string =>
  downtimeAssetMap[assetId]?.name ?? "Unknown Asset";