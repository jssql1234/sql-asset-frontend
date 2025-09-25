import type { ReactNode } from "react";
import { Card } from "@/components/ui/components";
import { cn } from "@/utils/utils";

export interface SummaryCardItem {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}

interface SummaryCardsProps {
  data: SummaryCardItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const toneMap: Record<Required<SummaryCardItem>["tone"], string> = {
  default: "text-onSurface",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-error",
};

const SummaryCards: React.FC<SummaryCardsProps> = ({
  data,
  columns = 4,
  className,
}) => {
  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 xl:grid-cols-4",
  }[columns];

  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-1",
        gridCols,
        className
      )}
    >
      {data.map((item) => (
        <Card
          key={item.label}
          className="flex flex-col gap-2 border border-outline bg-surfaceContainer text-onSurface shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="body-small text-onSurfaceVariant uppercase tracking-wide">
              {item.label}
            </div>
            {item.icon && <span className="text-primary">{item.icon}</span>}
          </div>
          <div
            className={cn(
              "title-large font-semibold",
              toneMap[item.tone ?? "default"]
            )}
          >
            {item.value}
          </div>
          {item.description && (
            <div className="body-small text-onSurfaceVariant">
              {item.description}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;
