import type { DowntimeIncident, DowntimeSummary } from "./types";

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

// Mock data - in real app this would come from API
export const mockIncidents: DowntimeIncident[] = [
  {
    id: "1",
    assetName: getDowntimeAssetName("CBT-001"),
    assetId: "CBT-001",
    priority: "High",
    status: "Down",
    startTime: "2025-09-26T08:30:00Z",
    description: "Motor overheating causing system shutdown",
    reportedBy: "John Smith",
  },
  {
    id: "2",
    assetName: getDowntimeAssetName("PMP-002"),
    assetId: "PMP-002",
    priority: "Medium",
    status: "Down",
    startTime: "2025-09-26T06:15:00Z",
    description: "Pressure valve malfunction",
    reportedBy: "Jane Doe",
  },
  {
    id: "3",
    assetName: getDowntimeAssetName("GEN-003"),
    assetId: "GEN-003",
    priority: "Critical",
    status: "Resolved",
    startTime: "2025-09-25T14:20:00Z",
    endTime: "2025-09-25T16:45:00Z",
    downtimeDuration: "2h 25m",
    description: "Complete power failure",
    reportedBy: "Mike Johnson",
    resolvedBy: "Sarah Wilson",
    resolutionNotes: "Replaced faulty alternator",
  },
  {
    id: "4",
    assetName: getDowntimeAssetName("AC-004"),
    assetId: "AC-004",
    priority: "Low",
    status: "Down",
    startTime: "2025-09-26T10:00:00Z",
    description: "Minor air leak detected, scheduled for maintenance",
    reportedBy: "Tom Davis",
  },
];

export const mockSummary: DowntimeSummary = {
  activeIncidents: 1,
  totalIncidents: 15,
  totalResolved: 12,
  totalDowntime: "48h 32m",
};

export const resolvedIncidents: DowntimeIncident[] = [
  {
    id: "3",
    assetName: getDowntimeAssetName("GEN-003"),
    assetId: "GEN-003",
    priority: "Critical",
    status: "Resolved",
    startTime: "2025-09-25T14:20:00Z",
    endTime: "2025-09-25T16:45:00Z",
    downtimeDuration: "2h 25m",
    description: "",
    resolutionNotes: "Replaced faulty alternator",
  },
  {
    id: "4",
    assetName: getDowntimeAssetName("HP-005"),
    assetId: "HP-005",
    priority: "High",
    status: "Resolved",
    startTime: "2025-09-24T10:30:00Z",
    endTime: "2025-09-24T14:15:00Z",
    downtimeDuration: "3h 45m",
    description: "",
    resolutionNotes: "Replaced damaged hydraulic seals and refilled fluid",
  },
  {
    id: "5",
    assetName: getDowntimeAssetName("CS-006"),
    assetId: "CS-006",
    priority: "Medium",
    status: "Resolved",
    startTime: "2025-09-23T16:00:00Z",
    endTime: "2025-09-23T18:30:00Z",
    downtimeDuration: "2h 30m",
    description: "",
    resolutionNotes: "Cleaned and replaced air filters, system operating normally",
  },
];