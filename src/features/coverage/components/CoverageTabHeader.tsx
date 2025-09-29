import type { ReactNode } from "react";
import { Button } from "@/components/ui/components";
import { cn } from "@/utils/utils";

interface CoverageTabHeaderProps {
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  actionIcon?: ReactNode;
  className?: string;
}

export const CoverageTabHeader = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  className,
}: CoverageTabHeaderProps) => {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div>
        <h2 className="title-large font-semibold text-onSurface">{title}</h2>
        <p className="body-medium text-onSurfaceVariant">{subtitle}</p>
      </div>
      <Button variant="default" onClick={onAction}>
        {actionIcon}
        {actionLabel}
      </Button>
    </div>
  );
};
