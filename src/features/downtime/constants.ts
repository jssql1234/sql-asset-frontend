import type { DowntimeIncident } from "./types";

export const getPriorityVariant = (priority: DowntimeIncident["priority"]) => {
  const variantMap = {
    Low: "blue",
    Medium: "yellow",
    High: "red",
    Critical: "red",
  } as const;
  return variantMap[priority];
};

export const PRIORITY_OPTIONS = [
  { value: "Low" as const, label: "Low" },
  { value: "Medium" as const, label: "Medium" },
  { value: "High" as const, label: "High" },
  { value: "Critical" as const, label: "Critical" },
] as const;

export const STATUS_OPTIONS = [
  { value: "Down" as const, label: "Down" },
  { value: "Resolved" as const, label: "Resolved" },
] as const;
