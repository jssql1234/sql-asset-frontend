import React from "react";
import { Badge } from "@/components/ui/components";
import type { CoverageStatus } from "@/features/coverage/types";

type BadgeVariant = "primary" | "red" | "green" | "yellow" | "blue" | "grey";

interface StatusBadgeProps {
  status: CoverageStatus;
  className?: string;
}

const statusVariantMap: Record<CoverageStatus, { variant: BadgeVariant; label: string }> = {
  Active: { variant: "green", label: "Active" },
  "Expiring Soon": { variant: "yellow", label: "Expiring Soon" },
  Expired: { variant: "red", label: "Expired" },
  Filed: { variant: "blue", label: "Filed" },
  Settled: { variant: "green", label: "Settled" },
  Approved: { variant: "green", label: "Approved" },
  Rejected: { variant: "red", label: "Rejected" },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusVariantMap[status];

  return (
    <Badge
      text={config.label}
      variant={config.variant}
      className={className}
      dot
    />
  );
};
