import { useDataQuery, type QueryOptions } from "@/hooks/useDataQuery";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";
import type { DowntimeIncident, DowntimeSummary } from "../types";
import type { CreateDowntimeInput, EditDowntimeInput } from "../zod/downtimeSchemas";
import {
  fetchDowntimeIncidents,
  fetchResolvedIncidents,
  fetchDowntimeSummary,
  createDowntimeIncident,
  updateDowntimeIncident,
  deleteDowntimeIncident,
} from "../services/downtimeService";

// Query keys for React Query cache management
export const DOWNTIME_QUERY_KEYS = {
  incidents: ["downtime", "incidents"] as const,
  resolved: ["downtime", "resolved"] as const,
  summary: ["downtime", "summary"] as const,
} as const;

// Hook to fetch all active downtime incidents
export function useGetDowntimeIncidents() {
  return useDataQuery<DowntimeIncident[]>({
    key: DOWNTIME_QUERY_KEYS.incidents,
    queryFn: fetchDowntimeIncidents,
    title: "Failed to load downtime incidents",
    description: "Please try again later",
  });
}

// Hook to fetch resolved downtime incidents
type ResolvedIncidentsQueryOptions = Pick<QueryOptions, "enabled">;

export function useGetResolvedIncidents(options?: ResolvedIncidentsQueryOptions) {
  return useDataQuery<DowntimeIncident[]>({
    key: DOWNTIME_QUERY_KEYS.resolved,
    queryFn: fetchResolvedIncidents,
    title: "Failed to load resolved incidents",
    description: "Please try again later",
    options,
  });
}

// Hook to fetch downtime summary statistics
export function useGetDowntimeSummary() {
  return useDataQuery<DowntimeSummary>({
    key: DOWNTIME_QUERY_KEYS.summary,
    queryFn: fetchDowntimeSummary,
    title: "Failed to load downtime summary",
    description: "Please try again later",
  });
}

/**
 * Shared utility to invalidate all downtime-related queries
 */
const invalidateDowntimeQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.incidents }),
    queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.resolved }),
    queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.summary }),
  ]);
};

// Hook to create a new downtime incident
export function useCreateDowntimeIncident(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: CreateDowntimeInput) => Promise.resolve(createDowntimeIncident(input)),
    onSuccess: async (_data, variables) => {
      await invalidateDowntimeQueries(queryClient);

      addToast({
        variant: "success",
        title: "Downtime Incident Created",
        description:
          variables.assetIds.length > 1
            ? `Downtime logged for ${String(variables.assetIds.length)} assets.`
            : "The incident has been logged successfully",
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to create downtime incident",
        description: error.message || "Please try again",
      });
    },
  });
}

// Hook to update an existing downtime incident
export function useUpdateDowntimeIncident(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (input: EditDowntimeInput) => Promise.resolve(updateDowntimeIncident(input)),
    onSuccess: async (_data, variables) => {
      await invalidateDowntimeQueries(queryClient);

      addToast({
        variant: "success",
        title: "Incident Updated",
        description:
          variables.assetIds.length > 1
            ? `The incident has been updated for ${String(variables.assetIds.length)} assets.`
            : "The incident has been updated successfully",
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to update incident",
        description: error.message || "Please try again",
      });
    },
  });
}

// Hook to delete a downtime incident
export function useDeleteDowntimeIncident(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      deleteDowntimeIncident(id);
      return Promise.resolve();
    },
    onSuccess: async () => {
      await invalidateDowntimeQueries(queryClient);

      addToast({
        variant: "success",
        title: "Incident Deleted",
        description: "The incident has been deleted successfully",
        duration: 5000,
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      addToast({
        variant: "error",
        title: "Failed to delete incident",
        description: error.message || "Please try again",
      });
    },
  });
}
