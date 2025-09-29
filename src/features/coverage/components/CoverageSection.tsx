import type { ReactNode } from "react";
import { Card } from "@/components/ui/components";
import { cn } from "@/utils/utils";

interface CoverageSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const CoverageSection = ({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: CoverageSectionProps) => {
  return (
    <Card className={cn("mt-0 space-y-4 border border-outline bg-surfaceContainer", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="title-small font-semibold text-onSurface">{title}</h3>
          {subtitle ? (
            <p className="body-small text-onSurfaceVariant">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="md:self-start">{action}</div> : null}
      </div>
      <div className={cn("space-y-3", contentClassName)}>{children}</div>
    </Card>
  );
};
