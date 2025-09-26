export interface DowntimeIncident {
  id: string;
  assetName: string;
  assetId: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Active" | "Resolved" | "In Progress";
  startTime: string; // ISO date string
  endTime?: string; // ISO date string, optional for active incidents
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

export interface FilterState {
  search: string;
  asset: string;
  status: string;
  priority: string;
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
  assetId: string;
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