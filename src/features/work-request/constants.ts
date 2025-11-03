import type { WorkRequest } from "./types";

export const getStatusVariant = (status: WorkRequest["status"]) => {
  const variantMap = {
    Pending: "yellow",
    Approved: "green",
    Rejected: "red",
  } as const;
  return variantMap[status];
};

export const REQUEST_TYPE_OPTIONS = [
  { value: "Maintenance" as const, label: "Maintenance" },
  { value: "Repair" as const, label: "Repair" },
  { value: "Inspection" as const, label: "Inspection" },
  { value: "Emergency" as const, label: "Emergency" },
] as const;
