import type { WorkRequest, WorkOrder, MaintenanceHistory } from '@/types/work-request';

// Work Request Service
export const workRequestService = {
  // Get all work requests from localStorage
  getWorkRequests: (): WorkRequest[] => {
    try {
      const saved = localStorage.getItem('workRequestData');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading work requests:', error);
      return [];
    }
  },

  // Save work requests to localStorage
  saveWorkRequests: (workRequests: WorkRequest[]) => {
    try {
      localStorage.setItem('workRequestData', JSON.stringify(workRequests));
    } catch (error) {
      console.error('Error saving work requests:', error);
      throw error;
    }
  },

  // Create a new work request
  createWorkRequest: (workRequestData: Omit<WorkRequest, 'id' | 'requestId' | 'requestDate'>) => {
    const workRequests = workRequestService.getWorkRequests();
    
    const newWorkRequest: WorkRequest = {
      ...workRequestData,
      id: `WR-${Date.now()}`,
      requestId: `WR-${Date.now()}`,
      requestDate: new Date().toISOString(),
    };

    workRequests.push(newWorkRequest);
    workRequestService.saveWorkRequests(workRequests);
    
    return newWorkRequest;
  },

  // Update work request status
  updateWorkRequestStatus: (requestId: string, status: WorkRequest['status'], rejectionReason?: string) => {
    const workRequests = workRequestService.getWorkRequests();
    const workRequest = workRequests.find(wr => wr.id === requestId);
    
    if (workRequest) {
      workRequest.status = status;
      
      if (status === 'Rejected' && rejectionReason) {
        workRequest.rejectionReason = rejectionReason;
        workRequest.managementNotes = rejectionReason;
      } else if (status === 'Approved') {
        workRequest.rejectionReason = undefined;
        workRequest.approvedDate = new Date().toISOString();
      }
      
      workRequestService.saveWorkRequests(workRequests);
      return workRequest;
    }
    
    throw new Error('Work request not found');
  },

  // Update work request with work order reference
  updateWorkRequestWithWorkOrder: (requestId: string, workOrderId: string) => {
    const workRequests = workRequestService.getWorkRequests();
    const workRequest = workRequests.find(wr => wr.id === requestId);
    
    if (workRequest) {
      workRequest.workOrderNumber = workOrderId;
      workRequest.workOrderCreatedDate = new Date().toISOString();
      workRequestService.saveWorkRequests(workRequests);
      return workRequest;
    }
    
    throw new Error('Work request not found');
  },

  // Delete a work request
  deleteWorkRequest: (requestId: string) => {
    const workRequests = workRequestService.getWorkRequests();
    const filteredRequests = workRequests.filter(wr => wr.id !== requestId);
    workRequestService.saveWorkRequests(filteredRequests);
  },
};

// Work Order Service
export const workOrderService = {
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

  // Save work orders to localStorage
  saveWorkOrders: (workOrders: WorkOrder[]) => {
    try {
      localStorage.setItem('workOrderData', JSON.stringify({ workOrders }));
    } catch (error) {
      console.error('Error saving work orders:', error);
      throw error;
    }
  },

  // Create a new work order
  createWorkOrder: (workOrderData: Omit<WorkOrder, 'id' | 'workOrderId' | 'createdDate'>) => {
    const workOrders = workOrderService.getWorkOrders();
    
    const newWorkOrder: WorkOrder = {
      ...workOrderData,
      id: `WO-${Date.now()}`,
      workOrderId: `WO-${Date.now()}`,
      createdDate: new Date().toISOString(),
    };

    workOrders.push(newWorkOrder);
    workOrderService.saveWorkOrders(workOrders);
    
    return newWorkOrder;
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

// Asset Service
export const assetService = {
  // Get asset data from localStorage
  getAssets: () => {
    try {
      const savedAssetData = localStorage.getItem('assetData');
      if (savedAssetData) {
        const parsed = JSON.parse(savedAssetData);
        return parsed.assets || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading asset data:', error);
      return [];
    }
  },
};
