import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, Package, FileText, Wrench, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/utils/utils";
import type { WidgetKind } from "../hooks/useDashboardWidgets";

interface DashboardCardProps {
  id: WidgetKind;
  title: string;
  value: number | string;
  description?: string;
  removable?: boolean;
  onRemove?: (id: WidgetKind) => void;
  isOverlay?: boolean;
}

const cardIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    "Total Assets": Package,
    "Work Requests": FileText,
    "Active Work Orders": Wrench,
    "Pending Work Requests": FileText,
    "Downtime Incidents": AlertTriangle,
    "Warranty Claims": Shield,
  };

const cardColours: Record<string, string> = {
  "Total Assets": "text-blue-600",
  "Work Requests": "text-purple-600",
  "Active Work Orders": "text-orange-600",
  "Pending Work Requests": "text-purple-600",
  "Downtime Incidents": "text-red-600",
  "Warranty Claims": "text-green-600",
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  id,
  title,
  value,
  description,
  removable,
  onRemove,
  isOverlay,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { origin: "active", widgetId: id },
  });

  const Icon = cardIcons[title];

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative flex flex-col gap-2 rounded-lg border border-outline bg-white p-4 shadow transition hover:shadow-lg w-[200px] flex-shrink-0",
        isDragging && !isOverlay && "opacity-50",
        isOverlay && "shadow-xl"
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-onSurface truncate">{title}</h3>
          {description ? <p className="text-xs text-onSurfaceVariant line-clamp-1 mt-0.5">{description}</p> : null}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {Icon ? <Icon className={cn("h-4 w-4", cardColours[title] ?? "text-onSurfaceVariant")} /> : null}
          {removable ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove?.(id);
              }}
              className="rounded-md p-0.5 text-onSurfaceVariant transition hover:bg-surfaceVariant hover:text-onSurface"
              aria-label={`Remove ${title}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </header>

      <div className="text-2xl font-bold text-onSurface">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
};