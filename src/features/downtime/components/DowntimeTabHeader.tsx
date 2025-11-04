
import { TabHeader } from "@/components/TabHeader";

interface DowntimeTabHeaderProps {
  onViewResolved: () => void;
  onLogDowntime: () => void;
}

export function DowntimeTabHeader({
  onViewResolved,
  onLogDowntime,
}: DowntimeTabHeaderProps) {
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