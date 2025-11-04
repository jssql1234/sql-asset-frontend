import type { MaintenanceType, MaintenanceStatus } from "./types";

// Maintenance Type Options
export const MAINTENANCE_TYPE_OPTIONS = [
  { value: "Preventive" as const, label: "Preventive" },
  { value: "Corrective" as const, label: "Corrective" },
  { value: "Upgrade/Modify" as const, label: "Upgrade/Modify" },
  { value: "Emergency" as const, label: "Emergency" },
] as const;

// Status Options
export const STATUS_OPTIONS = [
  { value: "Pending" as const, label: "Pending" },
  { value: "In Progress" as const, label: "In Progress" },
  { value: "Completed" as const, label: "Completed" },
  { value: "Overdue" as const, label: "Overdue" },
] as const;

// Service By Options
export const SERVICE_BY_OPTIONS = [
  { value: "In-House" as const, label: "In-House" },
  { value: "Outsourced" as const, label: "Outsourced" },
] as const;

// Warranty Status Options
export const WARRANTY_STATUS_OPTIONS = [
  { value: "No Warranty" as const, label: "No Warranty" },
  { value: "Claimable" as const, label: "Claimable" },
  { value: "Claimed" as const, label: "Claimed" },
] as const;

// Status variant mapping for badges
export const getStatusVariant = (status: MaintenanceStatus) => {
  const variantMap = {
    Pending: "yellow",
    "In Progress": "blue",
    Completed: "green",
    Overdue: "red",
  } as const;
  return variantMap[status];
};

// Type variant mapping for badges
export const getTypeVariant = (type: MaintenanceType) => {
  const variantMap = {
    Preventive: "blue",
    Corrective: "yellow",
    "Upgrade/Modify": "purple",
    Emergency: "red",
  } as const;
  return variantMap[type];
};
