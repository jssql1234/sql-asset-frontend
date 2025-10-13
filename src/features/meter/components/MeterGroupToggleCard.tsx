import { type ReactNode, useState } from "react";
import ToggleList from "@/components/ToggleList";
import { Button } from "@/components/ui/components";
import { cn } from "@/utils/utils";
import type { MeterGroup } from "../../../types/meter";
import { Copy, Delete, Edit } from "@/assets/icons";

export type MeterGroupToggleCardProps = {
  group: MeterGroup;
  boundaryLabel: string;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  children?: ReactNode;
};

const MeterGroupToggleCard = ({
  group,
  boundaryLabel,
  onEdit,
  onClone,
  onDelete,
  children,
}: MeterGroupToggleCardProps) => {
  const hasAssets = group.assignedAssets.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="overflow-hidden rounded-lg border border-outlineVariant shadow-md"
      data-expanded={isExpanded}
    >
      <ToggleList
        id={`meter-group-${group.id}`}
        className="p-4 sm:p-5"
        headerClassName="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        toggleButtonClassName="items-start gap-3"
        isExpanded={isExpanded}
        onToggle={setIsExpanded}
        toggleLabel={`Toggle details for ${group.name}`}
        header={
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-onSurface">{group.name}</span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                  hasAssets ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}
              >
                {hasAssets ? "Assets linked" : "No assets assigned"}
              </span>
            </div>
            {group.description ? (
              <p className="text-sm text-onSurfaceVariant">{group.description}</p>
            ) : null}
            <p className="text-xs uppercase tracking-wide text-onSurfaceVariant">
              Boundary trigger: {boundaryLabel}
            </p>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit className="size-5" />
              Edit group
            </Button>
            <Button size="sm" variant="secondary" onClick={onClone}>
              <Copy className="size-5" />
              Clone
            </Button>
            <Button size="" variant="destructive" onClick={onDelete}>
              <Delete className="size-5" />
              Delete
            </Button>
          </div>
        }
      />

      {children ? (
        <div
          className={cn(
            "transition-all",
            isExpanded ? "max-h-[1600px] opacity-100" : "max-h-0 overflow-hidden opacity-0"
          )}
          aria-hidden={!isExpanded}
        >
          <div className="space-y-4 border-t border-outlineVariant px-4 pb-4 pt-4 sm:px-5 sm:pb-5 bg-surface">
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MeterGroupToggleCard;
