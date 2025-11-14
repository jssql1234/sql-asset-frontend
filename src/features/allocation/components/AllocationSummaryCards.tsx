import type { SummaryCardItem } from "@/components/SummaryCards";
import { formatCount, formatCurrency, formatPercentage } from "../utils/formatters";
import type { AllocationSummary, RentalRecord, RentalStatus } from "../types";

export const getAllocationSummaryCards = (summary: AllocationSummary): SummaryCardItem[] => [
  {
    label: "Total Asset Quantity",
    value: formatCount(summary.totalAssets),
    description: "Across all categories",
  },
  {
    label: "Utilised Quantity",
    value: formatCount(summary.allocatedAssets),
    description: "Currently assigned",
  },
  {
    label: "Available Quantity",
    value: formatCount(summary.availableAssets),
    description: "Ready for deployment",
    tone: "success" as const,
  },
  {
    label: "Utilization Rate",
    value: formatPercentage(summary.utilizationRate),
    description: "Allocation efficiency",
    tone: summary.utilizationRate > 80 ? "warning" : "default",
  },
];

const RENTAL_STATUS_KEYS: readonly RentalStatus[] = [
  "Active",
  "Scheduled",
  "Completed",
  "Overdue",
  "Cancelled",
];

interface RentalStats {
  totalIncome: number;
  counts: Record<RentalStatus, number>;
}

const buildRentalStats = (rentals: RentalRecord[]): RentalStats => {
  const initialCounts = RENTAL_STATUS_KEYS.reduce<Record<RentalStatus, number>>(
    (accumulator, status) => {
      accumulator[status] = 0;
      return accumulator;
    },
    {} as Record<RentalStatus, number>
  );

  return rentals.reduce<RentalStats>(
    (accumulator, rental) => {
      accumulator.counts[rental.status] += 1;
      const rentalValue = rental.rentAmount ?? rental.quantity * (rental.rentPerUnit ?? 0);
      accumulator.totalIncome += rentalValue;
      return accumulator;
    },
    { counts: initialCounts, totalIncome: 0 }
  );
};

export const getRentalSummaryCards = (rentals: RentalRecord[]): SummaryCardItem[] => {
  const { counts, totalIncome } = buildRentalStats(rentals);

  return [
    {
      label: "Active Rentals",
      value: formatCount(counts.Active),
      description: "Currently in progress",
    },
    {
      label: "Scheduled Rentals",
      value: formatCount(counts.Scheduled),
      description: "Upcoming reservations",
    },
    {
      label: "Completed Rentals",
      value: formatCount(counts.Completed),
      description: "Successfully finished",
    },
    {
      label: "Total Income",
      value: formatCurrency(totalIncome),
      description: "From all rentals",
      tone: "success" as const,
    },
  ];
};
