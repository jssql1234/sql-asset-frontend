import type { ReactNode } from "react";
import { cn } from "@/utils/utils";

export interface CoverageDefinitionItem {
  label: string;
  value: ReactNode;
  align?: "start" | "end";
}

interface CoverageDefinitionListProps {
  items: CoverageDefinitionItem[];
  className?: string;
}

export const CoverageDefinitionList = ({
  items,
  className,
}: CoverageDefinitionListProps) => {
  return (
    <dl className={cn("space-y-3 body-medium text-onSurface", className)}>
      {items.map(({ label, value, align = "end" }) => (
        <div key={label} className="flex items-start justify-between gap-6">
          <dt className="text-onSurfaceVariant">{label}</dt>
          <dd className={cn("max-w-[60%]", align === "end" ? "text-right" : "text-left")}>{value}</dd>
        </div>
      ))}
    </dl>
  );
};
