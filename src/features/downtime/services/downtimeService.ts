import type { DowntimeIncident, DowntimeSummary } from "../types";
import type { CreateDowntimeInput, EditDowntimeInput, ResolveDowntimeInput } from "../zod/downtimeSchemas";
import { mockIncidents, resolvedIncidents } from "../mockData";

/**
 * Mock database - in a real application, this would be replaced with actual API calls
 */
let incidentsStore: DowntimeIncident[] = [...mockIncidents];
let resolvedStore: DowntimeIncident[] = [...resolvedIncidents];
let nextId = 100; // Start IDs from 100 for new incidents

/**
 * Helper function to calculate downtime duration
 */
const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end.getTime() - start.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

/**
 * Helper function to calculate summary statistics
 */
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
  const totalDowntime = `${hours}h ${minutes}m`;
  
  return {
    activeIncidents,
    totalIncidents,
    totalResolved,
    totalDowntime,
  };
};

/**
 * Fetch all active downtime incidents
 */
export const fetchDowntimeIncidents = async (): Promise<DowntimeIncident[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return Promise.resolve([...incidentsStore]);
};

/**
 * Fetch resolved downtime incidents
 */
export const fetchResolvedIncidents = async (): Promise<DowntimeIncident[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return Promise.resolve([...resolvedStore]);
};

/**
 * Fetch downtime summary statistics
 */
export const fetchDowntimeSummary = async (): Promise<DowntimeSummary> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return Promise.resolve(calculateSummary());
};

/**
 * Create a new downtime incident
 */
export const createDowntimeIncident = async (
  input: CreateDowntimeInput
): Promise<DowntimeIncident> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find asset name (in real app, this would come from asset API)
  const assetMap: Record<string, string> = {
    "CBT-001": "Conveyor Belt A1",
    "PMP-002": "Pump System B2",
    "GEN-003": "Generator C3",
    "CMP-004": "Compressor D4",
    "HP-005": "Hydraulic Press E5",
    "CS-006": "Cooling System F6",
  };
  
  const newIncident: DowntimeIncident = {
    id: String(nextId++),
    assetName: assetMap[input.assetId] || "Unknown Asset",
    assetId: input.assetId,
    priority: input.priority,
    status: "Down",
    startTime: input.startTime,
    endTime: input.endTime,
    description: input.description,
    reportedBy: input.reportedBy || "Current User",
  };
  
  // Calculate duration if end time is provided
  if (newIncident.endTime) {
    newIncident.downtimeDuration = calculateDuration(
      newIncident.startTime,
      newIncident.endTime
    );
  }
  
  incidentsStore = [newIncident, ...incidentsStore];
  return Promise.resolve(newIncident);
};

/**
 * Update an existing downtime incident
 */
export const updateDowntimeIncident = async (
  input: EditDowntimeInput
): Promise<DowntimeIncident> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = incidentsStore.findIndex(i => i.id === input.id);
  if (index === -1) {
    throw new Error("Incident not found");
  }
  
  const assetMap: Record<string, string> = {
    "CBT-001": "Conveyor Belt A1",
    "PMP-002": "Pump System B2",
    "GEN-003": "Generator C3",
    "CMP-004": "Compressor D4",
    "HP-005": "Hydraulic Press E5",
    "CS-006": "Cooling System F6",
  };
  
  const updatedIncident: DowntimeIncident = {
    ...incidentsStore[index],
    assetName: assetMap[input.assetId] || "Unknown Asset",
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
  
  return Promise.resolve(updatedIncident);
};

/**
 * Resolve a downtime incident
 */
export const resolveDowntimeIncident = async (
  input: ResolveDowntimeInput
): Promise<DowntimeIncident> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = incidentsStore.findIndex(i => i.id === input.id);
  if (index === -1) {
    throw new Error("Incident not found");
  }
  
  const resolvedIncident: DowntimeIncident = {
    ...incidentsStore[index],
    status: "Resolved",
    endTime: input.endTime,
    resolvedBy: input.resolvedBy,
    resolutionNotes: input.resolutionNotes,
    downtimeDuration: calculateDuration(incidentsStore[index].startTime, input.endTime),
  };
  
  // Move from active to resolved
  incidentsStore = incidentsStore.filter(i => i.id !== input.id);
  resolvedStore = [resolvedIncident, ...resolvedStore];
  
  return Promise.resolve(resolvedIncident);
};

/**
 * Delete a downtime incident
 */
export const deleteDowntimeIncident = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  incidentsStore = incidentsStore.filter(i => i.id !== id);
  resolvedStore = resolvedStore.filter(i => i.id !== id);
  
  return Promise.resolve();
};

/**
 * Reset the mock data (useful for testing)
 */
export const resetMockData = (): void => {
  incidentsStore = [...mockIncidents];
  resolvedStore = [...resolvedIncidents];
  nextId = 100;
};
