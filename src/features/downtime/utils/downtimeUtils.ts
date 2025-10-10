import type { DowntimeIncident } from "../types";

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
 * Calculate ongoing duration from start time to now
 * @param startTime - Start timestamp in ISO format
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export const calculateOngoingDuration = (startTime: string): string => {
  const now = new Date().toISOString();
  return calculateDuration(startTime, now);
};

/**
 * Sort incidents by priority and then by start time (newest first)
 * @param incidents - Array of downtime incidents
 * @returns Sorted array of incidents
 */
export const sortIncidentsByPriority = (
  incidents: DowntimeIncident[]
): DowntimeIncident[] => {
  const priorityOrder = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  };

  return [...incidents].sort((a, b) => {
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then sort by start time (newest first)
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });
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

/**
 * Format a date and time to a human-readable string
 * @param isoDate - ISO format date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (isoDate: string): string => {
  return `${formatDate(isoDate)} ${formatTime(isoDate)}`;
};

/**
 * Get status color variant for badges
 * @param status - Incident status
 * @returns Badge variant color
 */
export const getStatusVariant = (
  status: DowntimeIncident["status"]
): "primary" | "red" | "green" | "yellow" | "blue" | "grey" => {
  const statusMap: Record<
    DowntimeIncident["status"],
    "primary" | "red" | "green" | "yellow" | "blue" | "grey"
  > = {
    Down: "red",
    Resolved: "green",
  };

  return statusMap[status];
};

/**
 * Get priority color variant for badges
 * @param priority - Incident priority
 * @returns Badge variant color
 */
export const getPriorityVariant = (
  priority: DowntimeIncident["priority"]
): "primary" | "red" | "green" | "yellow" | "blue" | "grey" => {
  const priorityMap: Record<
    DowntimeIncident["priority"],
    "primary" | "red" | "green" | "yellow" | "blue" | "grey"
  > = {
    Critical: "red",
    High: "red",
    Medium: "yellow",
    Low: "blue",
  };

  return priorityMap[priority];
};

/**
 * Check if an incident is overdue (active for more than 24 hours)
 * @param incident - Downtime incident
 * @returns True if overdue
 */
export const isOverdue = (incident: DowntimeIncident): boolean => {
  if (incident.status === "Resolved") return false;

  const start = new Date(incident.startTime);
  const now = new Date();
  const diffHours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);

  return diffHours > 24;
};

/**
 * Get a list of unique assets from incidents
 * @param incidents - Array of downtime incidents
 * @returns Array of unique assets with IDs and names
 */
export const getUniqueAssets = (
  incidents: DowntimeIncident[]
): { id: string; name: string }[] => {
  const assetMap = new Map<string, string>();

  incidents.forEach((incident) => {
    if (!assetMap.has(incident.assetId)) {
      assetMap.set(incident.assetId, incident.assetName);
    }
  });

  return Array.from(assetMap.entries()).map(([id, name]) => ({ id, name }));
};
