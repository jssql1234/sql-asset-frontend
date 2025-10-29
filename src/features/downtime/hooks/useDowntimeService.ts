import { useDataQuery, type QueryOptions } from "@/hooks/useDataQuery";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/components/Toast";
import type { DowntimeIncident, DowntimeSummary } from "../types";
import type { CreateDowntimeInput, EditDowntimeInput } from "../zod/downtimeSchemas";
import { fetchDowntimeIncidents, fetchResolvedIncidents, fetchDowntimeSummary, createDowntimeIncident, updateDowntimeIncident, deleteDowntimeIncident } from "../services/downtimeService";

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

// Hook to create a new downtime incident
export function useCreateDowntimeIncident(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const createIncident = async (input: CreateDowntimeInput) => {
    try {
  const newIncident = createDowntimeIncident(input);
      
      // Invalidate and refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.incidents }),
        queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.summary }),
        queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.resolved }),
      ]);

      addToast({
        variant: "success",
        title: "Downtime Incident Created",
        description: input.assetIds.length > 1
          ? `Downtime logged for ${String(input.assetIds.length)} assets.`
          : "The incident has been logged successfully",
        duration: 5000,
      });

      onSuccess?.();
  return newIncident;
    } catch (error) {
      const description = error instanceof Error ? error.message : "Please try again";
      addToast({
        variant: "error",
        title: "Failed to create downtime incident",
        description,
      });
      throw error;
    }
  };

  return { mutate: createIncident, mutateAsync: createIncident, isPending: false };
}

// Hook to update an existing downtime incident
export function useUpdateDowntimeIncident(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const updateIncident = async (input: EditDowntimeInput) => {
    try {
      const updatedIncident = updateDowntimeIncident(input);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.incidents }),
        queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.resolved }),
        queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.summary }),
      ]);

      addToast({
        variant: "success",
        title: "Incident Updated",
        description: input.assetIds.length > 1
          ? `The incident has been updated for ${String(input.assetIds.length)} assets.`
          : "The incident has been updated successfully",
        duration: 5000,
      });

      onSuccess?.();
      return updatedIncident;
    } catch (error) {
      const description = error instanceof Error ? error.message : "Please try again";
      addToast({
        variant: "error",
        title: "Failed to update incident",
        description,
      });
      throw error;
    }
  };

  return { mutate: updateIncident, mutateAsync: updateIncident, isPending: false };
}

// Hook to delete a downtime incident
export function useDeleteDowntimeIncident(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const deleteIncident = async (id: string) => {
    try {
      deleteDowntimeIncident(id);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.incidents }),
        queryClient.invalidateQueries({ queryKey: DOWNTIME_QUERY_KEYS.summary }),
      ]);

      addToast({
        variant: "success",
        title: "Incident Deleted",
        description: "The incident has been deleted successfully",
        duration: 5000,
      });

      onSuccess?.();
    } catch (error) {
      const description = error instanceof Error ? error.message : "Please try again";
      addToast({
        variant: "error",
        title: "Failed to delete incident",
        description,
      });
      throw error;
    }
  };

  return { mutate: deleteIncident, mutateAsync: deleteIncident, isPending: false };
}
