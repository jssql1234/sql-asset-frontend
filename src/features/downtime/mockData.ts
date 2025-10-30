export interface DowntimeAssetGroup { id: string; label: string;assets: { id: string; name: string }[] }
export interface DowntimeAsset { id: string; name: string; groupId: string; groupLabel: string }

export const downtimeAssetGroups: DowntimeAssetGroup[] = [
  {
    id: "assembly-line",
    label: "Assembly Line",
    assets: [ { id: "CBT-001", name: "Conveyor Belt A1" }, { id: "PMP-002", name: "Pump System B2" } ],
  },
  {
    id: "power-systems",
    label: "Power Systems",
    assets: [
      { id: "GEN-003", name: "Generator C3" },
      { id: "AC-004", name: "Air Compressor D4" },
    ],
  },
  {
    id: "support-equipment",
    label: "Support Equipment",
    assets: [
      { id: "HP-005", name: "Hydraulic Press E5" },
      { id: "CS-006", name: "Cooling System F6" },
    ],
  },
  {
    id: "quality-control",
    label: "Quality Control",
    assets: [
      { id: "QC-007", name: "Quality Scanner G7" },
      { id: "TM-008", name: "Testing Machine H8" },
    ],
  },
  {
    id: "maintenance-tools",
    label: "Maintenance Tools",
    assets: [
      { id: "WR-009", name: "Welding Robot I9" },
      { id: "DM-010", name: "Diagnostic Machine J10" },
      { id: "WR-011", name: "Welding Robot K11" },
      { id: "DM-012", name: "Diagnostic Machine L12" },
      { id: "CR-013", name: "Calibration Robot M13" },
      { id: "TM-014", name: "Tooling Machine N14" },
      { id: "SM-015", name: "Soldering Machine O15" },
      { id: "PM-016", name: "Precision Machine P16" },
    ],
  },
];

export const downtimeAssets: DowntimeAsset[] = downtimeAssetGroups.flatMap((group) =>
  group.assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
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

// Mock downtime incidents data
import type { DowntimeIncident } from "./types";

export const mockActiveIncidents: DowntimeIncident[] = [
  {
    id: "1",
    assets: [
      { id: "TM-014", name: "Tooling Machine N14", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
    ],
    priority: "Low",
    status: "Down",
    description: "Hydraulic leak detected, press offline for repairs",
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Mike Johnson",
  },
  {
    id: "2",
    assets: [
      { id: "WR-011", name: "Welding Robot K11", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
      { id: "DM-012", name: "Diagnostic Machine L12", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
      { id: "CR-013", name: "Calibration Robot M13", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
    ],
    priority: "High",
    status: "Down",
    description: "Generator failed to start during routine test",
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reportedBy: "Jane Smith",
  },
  {
   id: "3",
    assets: [
      { id: "CBT-001", name: "Conveyor Belt A1", groupId: "assembly-line", groupLabel: "Assembly Line" },
      { id: "PMP-002", name: "Pump System B2", groupId: "assembly-line", groupLabel: "Assembly Line" },
      { id: "GEN-003", name: "Generator C3", groupId: "power-systems", groupLabel: "Power Systems" },
      { id: "AC-004", name: "Air Compressor D4", groupId: "power-systems", groupLabel: "Power Systems" },
      { id: "HP-005", name: "Hydraulic Press E5", groupId: "support-equipment", groupLabel: "Support Equipment" },
      { id: "CS-006", name: "Cooling System F6", groupId: "support-equipment", groupLabel: "Support Equipment" },
      { id: "QC-007", name: "Quality Scanner G7", groupId: "quality-control", groupLabel: "Quality Control" },
      { id: "TM-008", name: "Testing Machine H8", groupId: "quality-control", groupLabel: "Quality Control" },
      { id: "WR-009", name: "Welding Robot I9", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
      { id: "DM-010", name: "Diagnostic Machine J10", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
    ],
    priority: "Critical",
    status: "Down",
    description: "Motor overheating causing belt to slow down significantly",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reportedBy: "John Doe", 
  },
];

export const mockResolvedIncidents: DowntimeIncident[] = [
  {
    id: "4",
    assets: [
      { id: "PMP-002", name: "Pump System B2", groupId: "assembly-line", groupLabel: "Assembly Line" },
      { id: "GEN-003", name: "Generator C3", groupId: "power-systems", groupLabel: "Power Systems" },
      { id: "AC-004", name: "Air Compressor D4", groupId: "power-systems", groupLabel: "Power Systems" },
      { id: "HP-005", name: "Hydraulic Press E5", groupId: "support-equipment", groupLabel: "Support Equipment" },
      { id: "CS-006", name: "Cooling System F6", groupId: "support-equipment", groupLabel: "Support Equipment" },
      { id: "QC-007", name: "Quality Scanner G7", groupId: "quality-control", groupLabel: "Quality Control" },
      { id: "TM-008", name: "Testing Machine H8", groupId: "quality-control", groupLabel: "Quality Control" },
      { id: "WR-009", name: "Welding Robot I9", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
    ],
    priority: "High",
    status: "Resolved",
    description: "Pump system malfunction causing production delays",
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    downtimeDuration: "4h 0m",
    reportedBy: "Sarah Lee",
    resolvedBy: "Maintenance Team",
    resolutionNotes: "Replaced faulty impeller and checked seals. System tested and operational.",
  },
  {
    id: "5",
    assets: [
      { id: "DM-010", name: "Diagnostic Machine J10", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
      { id: "WR-011", name: "Welding Robot K11", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
      { id: "DM-012", name: "Diagnostic Machine L12", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
      { id: "CR-013", name: "Calibration Robot M13", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
      { id: "TM-014", name: "Tooling Machine N14", groupId: "maintenance-tools", groupLabel: "Maintenance Tools" },
    ],
    priority: "Low",
    status: "Resolved",
    description: "Scanner calibration error",
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
    downtimeDuration: "1h 0m",
    reportedBy: "Alex Chen",
    resolvedBy: "QC Team",
    resolutionNotes: "Recalibrated scanner and updated software. All quality checks passed.",
  },
];