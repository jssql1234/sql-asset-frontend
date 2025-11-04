// Maintenance Schedule Types

export type MaintenanceType = 
  | "Preventive" 
  | "Corrective" 
  | "Upgrade/Modify"
  | "Emergency";

export type MaintenanceStatus = 
  | "Pending"
  | "In Progress" 
  | "Completed" 
  | "Overdue";

export type ServiceBy = "In-House" | "Outsourced";

export type WarrantyStatus = "No Warranty" | "Claimable" | "Claimed";

export interface AssetCostAllocation {
  assetId: string;
  assetCode: string;
  assetName: string;
  allocatedCost: number;
}

export interface WorkOrder {
  id: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  jobTitle: string;
  description: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  serviceBy: ServiceBy;
  assignedTo?: string;
  requestedDate: string;
  scheduledDate: string;
  scheduledStartDateTime?: string;
  scheduledEndDateTime?: string;
  actualStartDateTime?: string;
  actualEndDateTime?: string;
  startDate?: string;
  completedDate?: string;
  estimatedCost: number;
  actualCost?: number;
  costAllocations?: AssetCostAllocation[];
  progress: number;
  notes?: string;
  partsUsed?: PartUsed[];
  logs?: MaintenanceLog[];
  warrantyId?: string;
  warrantyStatus?: WarrantyStatus;
}

export interface PartUsed {
  id: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface MaintenanceLog {
  id: string;
  timestamp: string;
  technician: string;
  notes: string;
}

export interface Warranty {
  id: string;
  assetIds: string[]; // Assets covered by this warranty
  startDate: string;
  endDate: string;
}

export interface WorkOrderSummary {
  totalWorkOrders: number;
  inProgress: number;
  completed: number;
  overdue: number;
  totalCost: number;
}

export interface WorkOrderFilters {
  search: string;
  assetId: string;
  type: string;
  status: string;
  serviceBy: string;
  assignedTo: string;
}

export interface WorkOrderFormData {
  assetId: string;
  assetName: string;
  jobTitle: string;
  description: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string;
  scheduledStartDateTime?: string;
  scheduledEndDateTime?: string;
  actualStartDateTime?: string;
  actualEndDateTime?: string;
  serviceBy: ServiceBy;
  assignedTo?: string;
  estimatedCost: number;
  actualCost?: number;
  costAllocations?: AssetCostAllocation[];
  notes?: string;
  partsUsed?: PartUsed[];
  warrantyId?: string;
  warrantyStatus?: WarrantyStatus;
}

export const DEFAULT_WORK_ORDER_FILTERS: WorkOrderFilters = {
  search: "",
  assetId: "",
  type: "",
  status: "",
  serviceBy: "",
  assignedTo: "",
};
