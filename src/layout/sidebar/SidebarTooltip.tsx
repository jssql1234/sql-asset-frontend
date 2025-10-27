import * as React from "react";
import { useSidebar } from "./SidebarContext";
import { SIDEBAR_TOOLTIP_DELAY } from "./SidebarConstant";

// Props for SidebarMenuButtonWithTooltip
export interface SidebarMenuButtonWithTooltipProps {
  tooltip?: string;
  children: React.ReactNode;
}

// Only shows tooltip when sidebar is collapsed
export function SidebarMenuButtonWithTooltip({
  tooltip,
  children,
}: SidebarMenuButtonWithTooltipProps) {
  const { state } = useSidebar();
  const [showTooltip, setShowTooltip] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const delayTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (delayTimerRef.current !== null) {
        window.clearTimeout(delayTimerRef.current);
        delayTimerRef.current = null;
      }
    };
  }, []);

  // Don't show tooltip if not provided or sidebar is expanded
  if (!tooltip || state !== "collapsed") {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={() => {
        delayTimerRef.current = window.setTimeout(() => {
          setShowTooltip(true);
        }, SIDEBAR_TOOLTIP_DELAY);
      }}
      onMouseLeave={() => {
        if (delayTimerRef.current !== null) {
          window.clearTimeout(delayTimerRef.current);
          delayTimerRef.current = null;
        }
        setShowTooltip(false);
      }}
      onBlur={() => {
        if (delayTimerRef.current !== null) {
          window.clearTimeout(delayTimerRef.current);
          delayTimerRef.current = null;
        }
        setShowTooltip(false);
      }}
    >
      {children}
      {showTooltip && (
        <div
          className="fixed z-[9999] bg-inverseSurface px-3 py-1.5 text-sm text-inverseOnSurface rounded-md shadow-md pointer-events-none whitespace-nowrap"
          style={{
            left: containerRef.current
              ? `${String(containerRef.current.getBoundingClientRect().right + 12)}px`
              : "0px",
            top: containerRef.current
              ? `${String(containerRef.current.getBoundingClientRect().top)}px`
              : "0px",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}
