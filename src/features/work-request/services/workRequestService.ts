import type { WorkRequest, MaintenanceHistory } from '../types';
import type { WorkOrder } from '@/types/work-request';
import { mockWorkRequests } from '../mockData';

// Mock database - in a real application, this would be replaced with actual API calls
let workRequestsStore: WorkRequest[] = [];
let nextId = 100;

// Initialize mock data stores
const initializeMockData = (): void => {
  if (workRequestsStore.length === 0) {
    const savedData = localStorage.getItem('workRequestData');
    if (savedData) {
      try {
        workRequestsStore = JSON.parse(savedData);
      } catch (error) {
        console.error('Error loading work requests:', error);
        workRequestsStore = [...mockWorkRequests];
      }
    } else {
      workRequestsStore = [...mockWorkRequests];
    }
    nextId = workRequestsStore.length + 1;
  }
};

// Save work requests to localStorage
const saveWorkRequests = (workRequests: WorkRequest[]): void => {
  try {
    localStorage.setItem('workRequestData', JSON.stringify(workRequests));
  } catch (error) {
    console.error('Error saving work requests:', error);
    throw error;
  }
};

// Fetch all work requests
export const fetchWorkRequests = (): Promise<WorkRequest[]> => {
  initializeMockData();
  return Promise.resolve([...workRequestsStore]);
};

// Create a new work request
export const createWorkRequest = (
  workRequestData: Omit<WorkRequest, 'id' | 'requestId' | 'requestDate'>
): Promise<WorkRequest> => {
  initializeMockData();
  
  const newWorkRequest: WorkRequest = {
    ...workRequestData,
    id: `WR-${nextId++}`,
    requestId: `WR-${Date.now()}`,
    requestDate: new Date().toISOString(),
  };

  workRequestsStore.unshift(newWorkRequest);
  saveWorkRequests(workRequestsStore);
  
  return Promise.resolve(newWorkRequest);
};

// Update work request status (approve/reject)
export const updateWorkRequestStatus = (
  requestId: string, 
  status: WorkRequest['status'], 
  rejectionReason?: string,
  managementNotes?: string
): Promise<WorkRequest> => {
  initializeMockData();
  
  const workRequest = workRequestsStore.find(wr => wr.id === requestId);
  
  if (!workRequest) {
    return Promise.reject(new Error('Work request not found'));
  }
  
  workRequest.status = status;
  
  if (status === 'Rejected') {
    if (rejectionReason) {
      workRequest.rejectionReason = rejectionReason;
    }
    if (managementNotes) {
      workRequest.managementNotes = managementNotes;
    }
  } else if (status === 'Approved') {
    workRequest.rejectionReason = undefined;
    workRequest.approvedDate = new Date().toISOString();
    if (managementNotes) {
      workRequest.managementNotes = managementNotes;
    }
  }
  
  saveWorkRequests(workRequestsStore);
  return Promise.resolve(workRequest);
};

// Work Order Service (internal helper)
const workOrderService = {
  // Get all work orders from localStorage
  getWorkOrders: (): WorkOrder[] => {
    try {
      const saved = localStorage.getItem('workOrderData');
      const data = saved ? JSON.parse(saved) : { workOrders: [] };
      return Array.isArray(data) ? data : (data.workOrders || []);
    } catch (error) {
      console.error('Error loading work orders:', error);
      return [];
    }
  },
};

// Maintenance History Service
export const maintenanceHistoryService = {
  // Get maintenance history for selected assets
  getMaintenanceHistory: (selectedAssets: { main: { code: string } }[]): MaintenanceHistory[] => {
    const workOrders = workOrderService.getWorkOrders();
    const assetCodes = new Set(selectedAssets.map(asset => asset.main.code));
    const history: MaintenanceHistory[] = [];

    workOrders.forEach(order => {
      let matchedAssetCode: string | null = null;

      // Check various possible asset reference structures
      if (order.selectedAssets && Array.isArray(order.selectedAssets)) {
        const foundAsset = order.selectedAssets.find(asset => 
          asset.main && assetCodes.has(asset.main.code)
        );
        if (foundAsset) {
          matchedAssetCode = foundAsset.main.code;
        }
      }

      if (matchedAssetCode) {
        const historyRecord: MaintenanceHistory = {
          assetCode: matchedAssetCode,
          type: 'Work Order',
          id: order.id,
          date: order.actualEndDateTime || order.scheduledEndDateTime || order.createdDate,
          description: order.description,
          technician: order.assignedTo,
          workType: order.workType,
          title: order.jobTitle,
          status: order.status
        };

        history.push(historyRecord);
      }
    });

    // Sort by date (newest first)
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
};
