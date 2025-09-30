import React, { useMemo } from "react";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import type { DowntimeSummary } from "@/features/downtime/types";

interface DowntimeSummaryCardProps {
  summary: DowntimeSummary;
}

export const DowntimeSummaryCard: React.FC<DowntimeSummaryCardProps> = ({ summary }) => {
  const summaryCardsData: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Active Incidents",
        value: summary.activeIncidents,
        description: "Currently unresolved",
        tone: summary.activeIncidents > 0 ? "danger" : "success",
      },
      {
        label: "Total Incidents",
        value: summary.totalIncidents,
        description: "All time recorded",
        tone: "default",
      },
      {
        label: "Total Resolved",
        value: summary.totalResolved,
        description: "Successfully fixed",
        tone: "success",
      },
      {
        label: "Total Downtime",
        value: summary.totalDowntime,
        description: "Cumulative duration",
        tone: "warning",
      },
    ],
    [summary]
  );

  return <SummaryCards data={summaryCardsData} columns={4} />;
};
