import type { DowntimeIncident } from "./types";

type PriorityVariant = "primary" | "red" | "green" | "yellow" | "blue" | "grey";

type PriorityVariantMap = Partial<Record<DowntimeIncident["priority"], PriorityVariant>>;

export const PRIORITY_BADGE_VARIANT: PriorityVariantMap = {
  Low: "blue",
  Medium: "yellow",
  High: "red",
  Critical: "red",
} as const;
