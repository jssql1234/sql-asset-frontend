import { useState } from "react";
import { cn } from "@/utils/utils";

export type ToggleListProps = {
  id?: string;
  className?: string;
  headerClassName?: string;
  toggleButtonClassName?: string;
  contentClassName?: string;
  header: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  disabled?: boolean;
  toggleLabel?: string;
};

export default function ToggleList({
  id,
  className,
  headerClassName,
  toggleButtonClassName,
  contentClassName,
  header,
  actions,
  children,
  isExpanded,
  defaultExpanded = false,
  onToggle,
  disabled = false,
  toggleLabel = "Toggle section",
}: ToggleListProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = isExpanded ?? internalExpanded;
  const hasContent = children !== undefined && children !== null;
  const contentId = id && hasContent ? `${id}-content` : undefined;

  const handleToggle = () => {
    if (disabled) return;
    if (isExpanded === undefined) {
      setInternalExpanded((prev) => !prev);
    }
    onToggle?.(!expanded);
  };

  return (
    <div id={id} className={cn(className)} data-expanded={expanded}>
      <div className={cn("flex items-start gap-3 text-onSurface", headerClassName)}>
        <button
          type="button"
          className={cn(
            "flex min-w-0 flex-1 items-start gap-3 text-left",
            disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
            toggleButtonClassName
          )}
          onClick={handleToggle}
          aria-expanded={expanded}
          aria-controls={contentId}
          disabled={disabled}
        >
          <span
            className={cn(
              "inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-outlineVariant text-sm transition-transform duration-200",
              expanded && "rotate-90"
            )}
            aria-hidden
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-200"
            >
              <path
                d="M8 6l4 4-4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="min-w-0 flex-1">{header}</div>
          <span className="sr-only">{toggleLabel}</span>
        </button>
        {actions ? (
          <div className="flex flex-none items-center gap-2" onClick={(event) => event.stopPropagation()}>
            {actions}
          </div>
        ) : null}
      </div>

      {hasContent ? (
        <div
          id={contentId}
          className={cn(
            "grid transition-all duration-200",
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
          aria-hidden={!expanded}
        >
          <div className={cn("overflow-hidden", contentClassName)}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}
