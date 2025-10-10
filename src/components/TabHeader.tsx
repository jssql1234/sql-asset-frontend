import type { ReactNode } from "react";
import { Button, type ButtonVariant } from "@/components/ui/components";
import { cn } from "@/utils/utils";

export interface TabHeaderAction {
  label: string;
  onAction?: () => void;
  icon?: ReactNode;
  variant?: ButtonVariant | (string & {});
  size?: string;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  position?: "inline" | "actions";
}

interface TabHeaderProps {
  title: string;
  subtitle?: string;
  actions?: TabHeaderAction[];
  customActions?: ReactNode;
  className?: string;
}

export const TabHeader = ({
  title,
  subtitle,
  actions,
  customActions,
  className,
}: TabHeaderProps) => {
  const renderInlineActions = () => {
    if (!actions?.length) return null;

    return actions
      .filter(action => action.position === "inline")
      .map(({ label, onAction, icon, variant, size, disabled, className, tooltip }) => (
        <Button
          key={label}
          variant={variant ?? "default"}
          size={size ?? "sm"}
          onClick={onAction}
          disabled={disabled}
          className={cn("ml-3", tooltip ? `has-tooltip ${className || ""}` : className)}
          data-tooltip={tooltip}
        >
          {icon}
          {label}
        </Button>
      ));
  };

  const renderActions = () => {
    if (customActions) {
      return customActions;
    }

    const regularActions = actions?.filter(action => action.position !== "inline") || [];

    if (!regularActions.length) {
      return null;
    }

    return (
      <div className="flex flex-wrap items-center gap-3">
        {regularActions.map(({ label, onAction, icon, variant, size, disabled, className, tooltip }) => (
          <Button
            key={label}
            variant={variant ?? "default"}
            size={size ?? (regularActions.length > 1 ? "sm" : "default")}
            onClick={onAction}
            disabled={disabled}
            className={tooltip ? `has-tooltip ${className || ""}` : className}
            data-tooltip={tooltip}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center">
        <div>
          <h2 className="title-large font-semibold text-onSurface">{title}</h2>
          {subtitle ? (
            <p className="body-medium text-onSurfaceVariant">{subtitle}</p>
          ) : null}
        </div>
        {renderInlineActions()}
      </div>
      {renderActions()}
    </div>
  );
};

export default TabHeader;
