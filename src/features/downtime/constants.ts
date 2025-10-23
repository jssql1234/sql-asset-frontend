import type { DowntimeIncident } from "./types";

type PriorityVariant = "primary" | "red" | "green" | "yellow" | "blue" | "grey";
type PriorityVariantMap = Partial<Record<DowntimeIncident["priority"], PriorityVariant>>;

export const PRIORITY_BADGE_VARIANT: PriorityVariantMap = {
  Low: "blue",
  Medium: "yellow",
  High: "red",
  Critical: "red",
} as const;

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
