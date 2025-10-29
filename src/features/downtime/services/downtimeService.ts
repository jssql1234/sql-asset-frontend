import type { DowntimeAssetInfo, DowntimeIncident, DowntimeSummary } from "../types";
import type { CreateDowntimeInput, EditDowntimeInput } from "../zod/downtimeSchemas";
import { getDowntimeAssetInfo, getDowntimeAssetName } from "../mockData";

// Utility functions for date/time formatting and duration calculations
/**
 * Calculate the duration between two timestamps
 * @param startTime - Start timestamp in ISO format
 * @param endTime - End timestamp in ISO format
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export const calculateDuration = (startTime: string, endTime: string): string => {
  const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  
  if (diffMs < 0) return "0m";
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return hours === 0 ? `${String(minutes)}m` : `${String(hours)}h ${String(minutes)}m`;
};

/**
 * Format a date to a human-readable string
 * @param isoDate - ISO format date string
 * @returns Formatted date string
 */
export const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString(undefined, {
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
  return new Date(isoDate).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Mock database - in a real application, this would be replaced with actual API calls
let incidentsStore: DowntimeIncident[] = [];
let resolvedStore: DowntimeIncident[] = [];
let nextId = 100; // Start IDs from 100 for new incidents

// Helper to convert asset ID to asset info
const mapAssetIdToInfo = (assetId: string): DowntimeAssetInfo => {
  const assetInfo = getDowntimeAssetInfo(assetId);
  return {
    id: assetId,
    name: assetInfo?.name ?? getDowntimeAssetName(assetId),
    groupId: assetInfo?.groupId,
    groupLabel: assetInfo?.groupLabel,
    location: assetInfo?.location,
  };
};

// Helper function to calculate summary statistics
const calculateSummary = (): DowntimeSummary => {
  const activeIncidents = incidentsStore.filter(i => i.status === "Down").length;
  const totalIncidents = incidentsStore.length + resolvedStore.length;
  const totalResolved = resolvedStore.length;
  
  // Calculate total downtime from resolved incidents
  const totalMinutes = resolvedStore.reduce((acc, incident) => {
    if (incident.startTime && incident.endTime) {
      const diffMs = new Date(incident.endTime).getTime() - new Date(incident.startTime).getTime();
      return acc + Math.floor(diffMs / (1000 * 60));
    }
    return acc;
  }, 0);
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const totalDowntime = `${String(hours)}h ${String(minutes)}m`;
  
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
export const createDowntimeIncident = (input: CreateDowntimeInput): DowntimeIncident => {
  const assets: DowntimeAssetInfo[] = input.assetIds.map(mapAssetIdToInfo);

  const incident: DowntimeIncident = {
    id: String(nextId++),
    assets,
    priority: input.priority,
    status: input.status,
    startTime: input.startTime,
    endTime: input.endTime,
    description: input.description,
    reportedBy: input.reportedBy ?? "Current User",
    downtimeDuration: input.endTime ? calculateDuration(input.startTime, input.endTime) : undefined,
  };

  const targetStore = input.status === "Resolved" ? resolvedStore : incidentsStore;
  targetStore.unshift(incident);

  return incident;
};

// Update an existing downtime incident
export const updateDowntimeIncident = (input: EditDowntimeInput): DowntimeIncident => {
  const assets: DowntimeAssetInfo[] = input.assetIds.map(mapAssetIdToInfo);

  const existingActiveIndex = incidentsStore.findIndex((incident) => incident.id === input.id);
  const existingResolvedIndex = resolvedStore.findIndex((incident) => incident.id === input.id);

  const baseIncident = existingActiveIndex !== -1 
    ? incidentsStore[existingActiveIndex]
    : existingResolvedIndex !== -1 
    ? resolvedStore[existingResolvedIndex]
    : null;

  if (!baseIncident) throw new Error("Incident not found");

  const updatedIncident: DowntimeIncident = {
    ...baseIncident,
    assets,
    priority: input.priority,
    status: input.status,
    description: input.description,
    startTime: input.startTime,
    endTime: input.endTime,
    reportedBy: input.reportedBy,
    resolvedBy: input.resolvedBy,
    resolutionNotes: input.resolutionNotes,
    downtimeDuration: input.endTime ? calculateDuration(input.startTime, input.endTime) : undefined,
  };

  // Remove from current store
  if (existingActiveIndex !== -1) {
    incidentsStore.splice(existingActiveIndex, 1);
  } else if (existingResolvedIndex !== -1) {
    resolvedStore.splice(existingResolvedIndex, 1);
  }

  // Add to appropriate store
  const targetStore = input.status === "Resolved" ? resolvedStore : incidentsStore;
  targetStore.unshift(updatedIncident);

  return updatedIncident;
};

// Delete a downtime incident
export const deleteDowntimeIncident = (id: string): void => {
  incidentsStore = incidentsStore.filter(i => i.id !== id);
  resolvedStore = resolvedStore.filter(i => i.id !== id);
};
