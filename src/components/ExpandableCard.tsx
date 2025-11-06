import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/utils/utils";
import { Badge } from "./ui/components";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/components/DropdownButton";
import { Dots } from "@/assets/icons";

export interface ExpandableCardAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ExpandableCardProps {
  title: string;
  subtitle?: string;
  badge?: { text: string; variant?: string };
  stats?: Array<{ label: string; value: string | number }>;
  actions?: ExpandableCardAction[];
  children?: ReactNode;
  defaultExpanded?: boolean;
  expandable?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export const ExpandableCard = ({
  title,
  subtitle,
  badge,
  stats,
  actions,
  children,
  defaultExpanded = false,
  expandable = true,
  isExpanded: controlledExpanded,
  onToggle,
  className,
}: ExpandableCardProps) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  const isExpanded = controlledExpanded ?? internalExpanded;
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  return (
    <div
      className={cn(
        "border border-outlineVariant rounded-lg bg-surface overflow-hidden transition-all",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-colors",
          expandable && "cursor-pointer hover:bg-hover",
          isExpanded && "bg-surfaceContainerHighest"
        )}
        onClick={expandable ? handleToggle : undefined}
      >
        {/* Expand Icon */}
        {expandable && (
          <button
            className="p-1 hover:bg-surfaceContainerHighest rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-onSurfaceVariant" />
            ) : (
              <ChevronRight className="h-5 w-5 text-onSurfaceVariant" />
            )}
          </button>
        )}

        {/* Title, Subtitle and Badge */}
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="title-medium text-onSurface">{title}</h3>
            {badge && (
              <Badge
                text={badge.text}
                variant={badge.variant as any}
                className="h-6 px-2 py-0.5 text-xs"
              />
            )}
          </div>
          {subtitle && (
            <p className="body-small text-onSurfaceVariant">{subtitle}</p>
          )}
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="headline-small text-onSurface">
                  {stat.value}
                </span>
                <span className="body-small text-onSurfaceVariant">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions Dropdown */}
        {actions && actions.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="p-2 hover:bg-hover rounded transition-colors"
                aria-label="Actions"
              >
                <Dots className="h-5 w-5 text-onSurfaceVariant" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => action.onClick()}
                    className={cn(
                      action.variant === "destructive" &&
                        "text-error focus:text-error"
                    )}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && children && (
        <div className="border-t border-outlineVariant ">{children}</div>
      )}
    </div>
  );
};

export default ExpandableCard;
