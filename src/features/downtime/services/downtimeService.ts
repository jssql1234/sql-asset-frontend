import type { DowntimeIncident, DowntimeSummary } from "../types";
import type { CreateDowntimeInput, EditDowntimeInput } from "../zod/downtimeSchemas";
import { getDowntimeAssetName } from "../mockData";

// Utility functions for date/time formatting and duration calculations
/**
 * Calculate the duration between two timestamps
 * @param startTime - Start timestamp in ISO format
 * @param endTime - End timestamp in ISO format
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  
  if (diffMs < 0) return "0m";
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours === 0) {
    return `${minutes.toString()}m`;
  }
  
  return `${hours.toString()}h ${minutes.toString()}m`;
};

/**
 * Format a date to a human-readable string
 * @param isoDate - ISO format date string
 * @returns Formatted date string
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format a time to a human-readable string
 * @param isoDate - ISO format date string
 * @returns Formatted time string
 */
export const formatTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Mock database - in a real application, this would be replaced with actual API calls
let incidentsStore: DowntimeIncident[] = [];
let resolvedStore: DowntimeIncident[] = [];
let nextId = 100; // Start IDs from 100 for new incidents

// Helper function to calculate summary statistics
const calculateSummary = (): DowntimeSummary => {
  const activeIncidents = incidentsStore.filter(i => i.status === "Down").length;
  const totalIncidents = incidentsStore.length + resolvedStore.length;
  const totalResolved = resolvedStore.length;
  
  // Calculate total downtime from resolved incidents
  let totalMinutes = 0;
  resolvedStore.forEach(incident => {
    if (incident.startTime && incident.endTime) {
      const start = new Date(incident.startTime);
      const end = new Date(incident.endTime);
      const diffMs = end.getTime() - start.getTime();
      totalMinutes += Math.floor(diffMs / (1000 * 60));
    }
  });
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalDowntime = `${hours.toString()}h ${minutes.toString()}m`;
  
  return {
    activeIncidents,
    totalIncidents,
    totalResolved,
    totalDowntime,
  };
};

// Fetch all active downtime incidents
export const fetchDowntimeIncidents = (): Promise<DowntimeIncident[]> => {
  return Promise.resolve([...incidentsStore]);
};

// Fetch resolved downtime incidents
export const fetchResolvedIncidents = (): Promise<DowntimeIncident[]> => {
  return Promise.resolve([...resolvedStore]);
};

// Fetch downtime summary statistics
export const fetchDowntimeSummary = (): Promise<DowntimeSummary> => {
  return Promise.resolve(calculateSummary());
};

// Create a new downtime incident
export const createDowntimeIncident = (
  input: CreateDowntimeInput
): DowntimeIncident => {
  // Find asset name (in real app, this would come from asset API)
  const newIncident: DowntimeIncident = {
    id: String(nextId++),
    assetName: getDowntimeAssetName(input.assetId),
    assetId: input.assetId,
    priority: input.priority,
    status: input.status,
    startTime: input.startTime,
    endTime: input.endTime,
    description: input.description,
    reportedBy: input.reportedBy ?? "Current User",
  };
  
  // Calculate duration if end time is provided
  if (newIncident.endTime) {
    newIncident.downtimeDuration = calculateDuration(
      newIncident.startTime,
      newIncident.endTime
    );
  }
  
  // If status is Resolved, add to resolved store, otherwise to incidents store
  if (input.status === "Resolved") {
    resolvedStore = [newIncident, ...resolvedStore];
  } else {
    incidentsStore = [newIncident, ...incidentsStore];
  }
  return newIncident;
};

// Update an existing downtime incident
export const updateDowntimeIncident = (
  input: EditDowntimeInput
): DowntimeIncident => {
  const index = incidentsStore.findIndex(i => i.id === input.id);
  if (index === -1) {
    throw new Error("Incident not found");
  }
  
  const updatedIncident: DowntimeIncident = {
    ...incidentsStore[index],
    assetName: getDowntimeAssetName(input.assetId),
    assetId: input.assetId,
    priority: input.priority,
    status: input.status,
    description: input.description,
    startTime: input.startTime,
    endTime: input.endTime,
    reportedBy: input.reportedBy,
    resolvedBy: input.resolvedBy,
    resolutionNotes: input.resolutionNotes,
  };
  
  // Calculate duration if end time is provided
  if (updatedIncident.endTime) {
    updatedIncident.downtimeDuration = calculateDuration(
      updatedIncident.startTime,
      updatedIncident.endTime
    );
  }
  
  // If status changed to Resolved, move to resolved store
  if (input.status === "Resolved" && incidentsStore[index].status !== "Resolved") {
    incidentsStore = incidentsStore.filter(i => i.id !== input.id);
    resolvedStore = [updatedIncident, ...resolvedStore];
  } else {
    incidentsStore[index] = updatedIncident;
  }
  
  return updatedIncident;
};

// Delete a downtime incident
export const deleteDowntimeIncident = (id: string): void => {
  incidentsStore = incidentsStore.filter(i => i.id !== id);
  resolvedStore = resolvedStore.filter(i => i.id !== id);
};
