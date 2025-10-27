import type { AllocationSummary } from "../types";
import type { SummaryCardItem } from "@/components/SummaryCards";

export const getAllocationSummaryCards = (summary: AllocationSummary): SummaryCardItem[] => [
  {
    label: "Total Asset Quantity",
    value: summary.totalAssets.toLocaleString(),
    description: "Across all categories",
  },
  {
    label: "Utilised Quantity",
    value: summary.allocatedAssets.toLocaleString(),
    description: "Currently assigned",
    tone: "warning" as const,
  },
  {
    label: "Available Quantity",
    value: summary.availableAssets.toLocaleString(),
    description: "Ready for deployment",
    tone: "success" as const,
  },
  {
    label: "Utilization Rate",
    value: `${summary.utilizationRate.toString()}%`,
    description: "Allocation efficiency",
    tone: summary.utilizationRate > 75 ? "warning" : "default",
  },
];

export const getRentalSummaryCards = (
  rentals: { status: string; quantity: number }[]
) => {
  const stats = rentals.reduce<Record<string, number>>(
    (acc, rental) => {
      acc.total += 1;
      acc[rental.status] = (acc[rental.status] ?? 0) + 1;
      acc.totalIncome += rental.quantity * 50; // Assume $50 per unit
      return acc;
    },
    { total: 0, totalIncome: 0, Active: 0, Scheduled: 0, Completed: 0, Overdue: 0, Cancelled: 0 }
  );

  return [
    {
      label: "Active Rentals",
      value: stats.Active,
      description: "Currently in progress",
      tone: "success" as const,
    },
    {
      label: "Scheduled Rentals",
      value: stats.Scheduled,
      description: "Upcoming reservations",
      tone: "warning" as const,
    },
    {
      label: "Completed Rentals",
      value: stats.Completed,
      description: "Successfully finished",
      tone: "default" as const,
    },
    {
      label: "Total Income",
      value: `RM ${stats.totalIncome.toLocaleString()}`,
      description: "From all rentals",
      tone: "success" as const,
    },
  ];
};
