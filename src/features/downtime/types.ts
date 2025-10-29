export interface DowntimeAssetInfo {
  id: string;
  name: string;
  groupId?: string;
  groupLabel?: string;
  location?: string;
}

export interface DowntimeIncident {
  id: string;
  assets: DowntimeAssetInfo[];
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Down" | "Resolved";
  startTime: string; // ISO date string
  endTime?: string; // ISO date string, optional for down incidents
  downtimeDuration?: string; // Calculated duration string
  description: string;
  reportedBy?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface DowntimeSummary {
  activeIncidents: number;
  totalIncidents: number;
  totalResolved: number;
  totalDowntime: string; // Total downtime duration formatted string
}

export interface ModalState {
  logDowntime: boolean;
  editIncident: boolean;
  resolvedIncidents: boolean;
}

export interface AssetOption {
  id: string;
  name: string;
  location?: string;
  type?: string;
}

export interface DowntimeFormData {
  assetIds: string[];
  priority: DowntimeIncident["priority"];
  description: string;
  startTime: string;
  endTime?: string;
}

export interface EditIncidentFormData extends DowntimeFormData {
  id: string;
  status: DowntimeIncident["status"];
  resolutionNotes?: string;
}