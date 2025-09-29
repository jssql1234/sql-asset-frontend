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
  const renderActions = () => {
    if (customActions) {
      return customActions;
    }

    if (!actions?.length) {
      return null;
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        {actions.map(({ label, onAction, icon, variant, size, disabled }) => (
          <Button
            key={label}
            variant={variant ?? "default"}
            size={size ?? (actions.length > 1 ? "sm" : "default")}
            onClick={onAction}
            disabled={disabled}
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
      <div>
        <h2 className="title-large font-semibold text-onSurface">{title}</h2>
        {subtitle ? (
          <p className="body-medium text-onSurfaceVariant">{subtitle}</p>
        ) : null}
      </div>
      {renderActions()}
    </div>
  );
};

export default TabHeader;
