import { useDataQuery, type QueryOptions } from "@/hooks/useDataQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";
import type { WorkOrder, Warranty } from "../types";
import { 
  fetchWorkOrders, 
  fetchWorkOrderById,
  createWorkOrder, 
  updateWorkOrder,
  deleteWorkOrder,
  checkWarrantyCoverage
} from "../services/workOrderService";

// Query keys for React Query cache management
export const WORK_ORDER_QUERY_KEYS = {
  workOrders: ["workOrders"] as const,
  workOrder: (id: string) => ["workOrders", id] as const,
} as const;

// Hook to fetch all work orders
type WorkOrderQueryOptions = Pick<QueryOptions, "enabled">;

export function useGetWorkOrders(options?: WorkOrderQueryOptions) {
  return useDataQuery<WorkOrder[]>({
    key: WORK_ORDER_QUERY_KEYS.workOrders,
    queryFn: fetchWorkOrders,
    title: "Failed to load work orders",
    description: "Please try again later",
    options,
  });
}

// Hook to fetch single work order
export function useGetWorkOrder(id: string, options?: WorkOrderQueryOptions) {
  return useDataQuery<WorkOrder | null>({
    key: WORK_ORDER_QUERY_KEYS.workOrder(id),
    queryFn: () => fetchWorkOrderById(id),
    title: "Failed to load work order",
    description: "Please try again later",
    options,
  });
}

// Shared utility to invalidate work order queries
const invalidateWorkOrderQueries = async (queryClient: any) => {
  await queryClient.invalidateQueries({ queryKey: WORK_ORDER_QUERY_KEYS.workOrders });
};

// Hook to create a new work order
export function useCreateWorkOrder(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<WorkOrder, Error, Omit<WorkOrder, 'id' | 'requestedDate' | 'progress'>>({
    mutationFn: createWorkOrder,
    onSuccess: async (data) => {
      await invalidateWorkOrderQueries(queryClient);

      addToast({
        variant: "success",
        title: "Work Order Created",
        description: `Work order ${data.id} has been created successfully.`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to create work order",
        description: error.message || "Please try again",
      });
    },
  });
}

// Hook to update a work order
export function useUpdateWorkOrder(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<WorkOrder, Error, { id: string; data: Partial<WorkOrder> }>({
    mutationFn: async ({ id, data }) => updateWorkOrder(id, data),
    onSuccess: async (data) => {
      await invalidateWorkOrderQueries(queryClient);

      addToast({
        variant: "success",
        title: "Work Order Updated",
        description: `Work order ${data.id} has been updated successfully.`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to update work order",
        description: error.message || "Please try again",
      });
    },
  });
}

// Hook to delete a work order
export function useDeleteWorkOrder(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: deleteWorkOrder,
    onSuccess: async () => {
      await invalidateWorkOrderQueries(queryClient);

      addToast({
        variant: "success",
        title: "Work Order Deleted",
        description: "The work order has been deleted successfully.",
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to delete work order",
        description: error.message || "Please try again",
      });
    },
  });
}

// Hook to check warranty coverage
export function useCheckWarranty() {
  const { addToast } = useToast();

  return useMutation<
    { success: boolean; data: Warranty | null; message?: string },
    Error,
    string[]
  >({
    mutationFn: checkWarrantyCoverage,
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to check warranty",
        description: error.message || "Please try again",
      });
    },
  });
}
