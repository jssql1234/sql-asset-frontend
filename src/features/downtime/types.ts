export interface DowntimeAssetInfo {
  id: string;
  name: string;
  groupId?: string;
  groupLabel?: string;
}

export interface DowntimeIncident {
  id: string;
  assets: DowntimeAssetInfo[];
  priority: "Low" | "High" | "Critical";
  status: "Down" | "Resolved";
  startTime: string; 
  endTime?: string; 
  downtimeDuration?: string; 
  description: string;
  reportedBy?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface DowntimeSummary { activeIncidents: number; totalIncidents: number; totalResolved: number; totalDowntime: string }

export interface ModalState {
  logDowntime: boolean;
  editIncident: boolean;
  resolvedIncidents: boolean;
}

export interface AssetOption {
  id: string;
  name: string;
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