import type { WorkOrder } from '../types';
import { MOCK_WORK_ORDERS } from '../mockData';

// Mock database - in a real application, this would be replaced with actual API calls
let workOrdersStore: WorkOrder[] = [];

// Initialize mock data stores
const initializeMockData = (): void => {
  if (workOrdersStore.length === 0) {
    const savedData = localStorage.getItem('workOrderData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        workOrdersStore = Array.isArray(parsed) ? parsed : (parsed.workOrders || []);
      } catch (error) {
        console.error('Error loading work orders:', error);
        workOrdersStore = [...MOCK_WORK_ORDERS];
      }
    } else {
      workOrdersStore = [...MOCK_WORK_ORDERS];
    }
  }
};

// Save work orders to localStorage
const saveWorkOrders = (workOrders: WorkOrder[]): void => {
  try {
    localStorage.setItem('workOrderData', JSON.stringify({ workOrders }));
  } catch (error) {
    console.error('Error saving work orders:', error);
    throw error;
  }
};

// Fetch all work orders
export const fetchWorkOrders = (): Promise<WorkOrder[]> => {
  initializeMockData();
  return Promise.resolve([...workOrdersStore]);
};

// Fetch single work order by ID
export const fetchWorkOrderById = (id: string): Promise<WorkOrder | null> => {
  initializeMockData();
  const workOrder = workOrdersStore.find(wo => wo.id === id);
  return Promise.resolve(workOrder || null);
};

// Create a new work order
export const createWorkOrder = (
  workOrderData: Omit<WorkOrder, 'id' | 'requestedDate' | 'progress'>
): Promise<WorkOrder> => {
  initializeMockData();
  
  const newWorkOrder: WorkOrder = {
    ...workOrderData,
    id: `WO-${Date.now()}`,
    requestedDate: new Date().toISOString().split("T")[0],
    progress: 0,
  };

  workOrdersStore.unshift(newWorkOrder);
  saveWorkOrders(workOrdersStore);
  
  return Promise.resolve(newWorkOrder);
};

// Update an existing work order
export const updateWorkOrder = (
  id: string,
  workOrderData: Partial<WorkOrder>
): Promise<WorkOrder> => {
  initializeMockData();
  
  const index = workOrdersStore.findIndex(wo => wo.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error('Work order not found'));
  }
  
  workOrdersStore[index] = {
    ...workOrdersStore[index],
    ...workOrderData,
  };
  
  saveWorkOrders(workOrdersStore);
  return Promise.resolve(workOrdersStore[index]);
};

// Delete a work order
export const deleteWorkOrder = (id: string): Promise<void> => {
  initializeMockData();
  
  workOrdersStore = workOrdersStore.filter(wo => wo.id !== id);
  saveWorkOrders(workOrdersStore);
  
  return Promise.resolve();
};
