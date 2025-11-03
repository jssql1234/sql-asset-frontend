import { useDataQuery, type QueryOptions } from "@/hooks/useDataQuery";
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";
import type { WorkRequest } from "../types";
import {
  fetchWorkRequests,
  createWorkRequest,
  updateWorkRequestStatus,
} from "../services/workRequestService";

// Query keys for React Query cache management
export const WORK_REQUEST_QUERY_KEYS = {
  requests: ["workRequests"] as const,
  request: (id: string) => ["workRequests", id] as const,
} as const;

// Hook to fetch all work requests
type WorkRequestQueryOptions = Pick<QueryOptions, "enabled">;

export function useGetWorkRequests(options?: WorkRequestQueryOptions) {
  return useDataQuery<WorkRequest[]>({
    key: WORK_REQUEST_QUERY_KEYS.requests,
    queryFn: fetchWorkRequests,
    title: "Failed to load work requests",
    description: "Please try again later",
    options,
  });
}

// Shared utility to invalidate all work request queries
const invalidateWorkRequestQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({
    queryKey: WORK_REQUEST_QUERY_KEYS.requests,
  });
};

// Hook to create a new work request
export function useCreateWorkRequest(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<
    WorkRequest,
    Error,
    Omit<WorkRequest, "id" | "requestId" | "requestDate">
  >({
    mutationFn: createWorkRequest,
    onSuccess: async (data) => {
      await invalidateWorkRequestQueries(queryClient);

      addToast({
        variant: "success",
        title: "Work Request Created",
        description: `Work request ${data.requestId} has been submitted successfully.`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to create work request",
        description: error.message || "Please try again",
      });
    },
  });
}

// Hook to update work request status (approve/reject)
interface UpdateStatusInput {
  requestId: string;
  status: WorkRequest["status"];
  rejectionReason?: string;
  managementNotes?: string;
}

export function useUpdateWorkRequestStatus(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation<WorkRequest, Error, UpdateStatusInput>({
    mutationFn: async (input) => {
      return updateWorkRequestStatus(
        input.requestId,
        input.status,
        input.rejectionReason,
        input.managementNotes
      );
    },
    onSuccess: async (data, variables) => {
      await invalidateWorkRequestQueries(queryClient);

      const statusText =
        variables.status === "Approved"
          ? "approved"
          : variables.status === "Rejected"
          ? "rejected"
          : "updated";

      addToast({
        variant: "success",
        title: "Work Request Updated",
        description: `Work request ${data.requestId} has been ${statusText}.`,
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to update work request",
        description: error.message || "Please try again",
      });
    },
  });
}
