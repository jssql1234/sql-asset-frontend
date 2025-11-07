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
export interface CreateWorkRequestFormData {
  technicianName: string;
  department: string;
  selectedAssets: WorkRequestAsset[];
  requestType: WorkRequest['requestType'];
  problemDescription: string;
  additionalNotes?: string;
  photos?: File[];
}

// User Management Types
export interface User {
  name: string;
  department: string;
}
