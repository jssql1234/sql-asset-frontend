// Work Request Types
export interface WorkRequest {
  id: string;
  requestId: string;
  requesterName: string;
  department: string;
  selectedAssets: WorkRequestAsset[];
  requestType: 'Maintenance' | 'Repair' | 'Inspection' | 'Emergency';
  problemDescription: string;
  additionalNotes?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
  approvedDate?: string;
  rejectionReason?: string;
  managementNotes?: string;
  workOrderNumber?: string;
  workOrderCreatedDate?: string;
  photos?: WorkRequestPhoto[];
}

export interface WorkRequestAsset {
  main: {
    code: string;
    name: string;
    description?: string;
    location?: string;
  };
}

export interface WorkRequestPhoto {
  id: string;
  filename: string;
  url: string;
  uploadDate: string;
}

// Work Order Types
export interface WorkOrder {
  id: string;
  workOrderId: string;
  jobTitle: string;
  description?: string;
  selectedAssets: WorkRequestAsset[];
  workType: 'Preventive' | 'Corrective' | 'Upgrade/Modification' | 'Project';
  priority: 'Normal' | 'Critical' | 'Emergency';
  status: 'Approved' | 'In Progress' | 'Completed' | 'Overdue';
  serviceBy: 'In-House' | 'Outsourced';
  assignedTo: string;
  scheduledStartDateTime: string;
  scheduledEndDateTime: string;
  actualStartDateTime?: string;
  actualEndDateTime?: string;
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
  createdDate: string;
  workRequestId?: string;
}

// Filter and UI Types
export interface WorkRequestFilters {
  search: string;
  status: WorkRequest['status'] | "";
  type: WorkRequest['requestType'] | "";
  department: string;
  requester: string;
  asset: string;
  date: string;
  description: string;
}

export interface WorkRequestSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  completionRate: number;
}

export interface MaintenanceHistory {
  assetCode: string;
  type: 'Work Order' | 'Work Request';
  id: string;
  date: string;
  description?: string;
  technician?: string;
  workType?: string;
  title?: string;
  status: string;
}

// Form Data Types
export interface CreateWorkRequestForm {
  technicianName: string;
  department: string;
  selectedAssets: WorkRequestAsset[];
  requestType: WorkRequest['requestType'];
  problemDescription: string;
  additionalNotes?: string;
  photos?: File[];
}

export interface CreateWorkOrderForm {
  jobTitle: string;
  description?: string;
  selectedAssets: WorkRequestAsset[];
  workType: WorkOrder['workType'];
  priority: WorkOrder['priority'];
  status: WorkOrder['status'];
  serviceBy: WorkOrder['serviceBy'];
  assignedTo: string;
  scheduledStartDateTime: string;
  scheduledEndDateTime: string;
  actualStartDateTime?: string;
  actualEndDateTime?: string;
  estimatedCost: number;
  actualCost?: number;
  notes?: string;
}

// User Management Types
export interface User {
  name: string;
  department: string;
}

export interface AssetSearchResult {
  main: {
    code: string;
    name: string;
    description?: string;
    location?: string;
  };
}

// Status and Type Enums
export const WorkRequestStatus = {
  PENDING: 'Pending' as const,
  APPROVED: 'Approved' as const,
  REJECTED: 'Rejected' as const,
};

export const WorkRequestType = {
  MAINTENANCE: 'Maintenance' as const,
  REPAIR: 'Repair' as const,
  INSPECTION: 'Inspection' as const,
  EMERGENCY: 'Emergency' as const,
};

export const WorkOrderType = {
  PREVENTIVE: 'Preventive' as const,
  CORRECTIVE: 'Corrective' as const,
  UPGRADE_MODIFICATION: 'Upgrade/Modification' as const,
  PROJECT: 'Project' as const,
};

export const Priority = {
  NORMAL: 'Normal' as const,
  CRITICAL: 'Critical' as const,
  EMERGENCY: 'Emergency' as const,
};

export const ServiceType = {
  IN_HOUSE: 'In-House' as const,
  OUTSOURCED: 'Outsourced' as const,
};