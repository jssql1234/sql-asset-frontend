import React from "react";
import { TabHeader } from "@/components/TabHeader";

interface DowntimeTabHeaderProps {
  onViewResolved: () => void;
  onLogDowntime: () => void;
}

export const DowntimeTabHeader: React.FC<DowntimeTabHeaderProps> = ({
  onViewResolved,
  onLogDowntime,
}) => {
  return (
    <TabHeader
      title="Downtime Tracking"
      subtitle="Monitor and manage asset downtime incidents"
      actions={[
        {
          label: "View Resolved",
          onAction: onViewResolved,
          variant: "outline",
        },
        {
          label: "Log Downtime",
          onAction: onLogDowntime,
          variant: "default",
        },
      ]}
    />
  );
};