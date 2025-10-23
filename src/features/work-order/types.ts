// Maintenance Schedule Types

export type MaintenanceType = 
  | "Preventive" 
  | "Corrective" 
  | "Upgrade/Modify";

export type MaintenancePriority = "Normal" | "Critical" | "Emergency";

export type MaintenanceStatus = 
  | "Pending"
  | "In Progress" 
  | "Completed" 
  | "Overdue";

export type ServiceBy = "In-House" | "Outsourced";

export interface AssetCostAllocation {
  assetId: string;
  assetCode: string;
  assetName: string;
  allocatedCost: number;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  assetId: string;
  assetName: string;
  assetCode: string;
  jobTitle: string;
  description: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
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

export interface MaintenanceSummary {
  totalScheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
  totalCost: number;
  utilizationRate: number;
}

export interface WorkOrderSummary {
  totalWorkOrders: number;
  pending: number;
  inProgress: number;
  completed: number;
  avgCompletionTime: number;
  totalCost: number;
}

export interface MaintenanceFilters {
  search: string;
  assetId: string;
  type: string;
  priority: string;
  status: string;
  serviceBy: string;
  dateFrom: string;
  dateTo: string;
}

export interface WorkOrderFilters {
  search: string;
  assetId: string;
  type: string;
  priority: string;
  status: string;
  serviceBy: string;
  assignedTo: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  assetName: string;
  status: MaintenanceStatus;
}

export interface MaintenanceModalState {
  createSchedule: boolean;
  editSchedule: boolean;
  createWorkOrder: boolean;
  editWorkOrder: boolean;
  transferFromRequest: boolean;
  warrantyClaim: boolean;
  viewDetails: boolean;
}

export interface WorkOrderFormData {
  workOrderNumber: string;
  assetId: string;
  assetName: string;
  jobTitle: string;
  description: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
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
  warrantyId?: string;
}

export interface ScheduleFormData {
  assetId: string;
  assetName: string;
  taskDescription: string;
  type: MaintenanceType;
  priority: MaintenancePriority;
  scheduledDate: string;
  frequency?: string;
  serviceBy: ServiceBy;
  assignedTechnician?: string;
  estimatedCost: number;
  notes?: string;
}

export const DEFAULT_MAINTENANCE_FILTERS: MaintenanceFilters = {
  search: "",
  assetId: "",
  type: "",
  priority: "",
  status: "",
  serviceBy: "",
  dateFrom: "",
  dateTo: "",
};

export const DEFAULT_WORK_ORDER_FILTERS: WorkOrderFilters = {
  search: "",
  assetId: "",
  type: "",
  priority: "",
  status: "",
  serviceBy: "",
  assignedTo: "",
};
