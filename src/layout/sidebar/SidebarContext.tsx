/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { SIDEBAR_COOKIE_NAME, SIDEBAR_COOKIE_MAX_AGE, SIDEBAR_KEYBOARD_SHORTCUT } from "./SidebarConstant";

/**
 * Type definition for the sidebar context value.
 * Provides state and methods for controlling sidebar behavior.
 */
interface SidebarContextValue {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

//Retrieves a cookie value by name from document.cookie.
function getCookieValue(name: string): string | null {   
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() ?? null : null;
}

//Sets a cookie with the specified name, value, and max age.
function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${String(maxAge)}`;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

/**
 * Custom hook to access the sidebar context.
 * Must be used within a SidebarProvider component.
 * @returns The sidebar context value containing state and control methods
 * @throws Error if used outside of SidebarProvider
 */
export function useSidebar(): SidebarContextValue {
  const context = React.use(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
}

export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Provider component that manages sidebar state and persistence.
 * Supports both controlled and uncontrolled modes, cookie persistence, and keyboard shortcuts.
 */
export function SidebarProvider({ children, defaultOpen = true, open: controlledOpen, onOpenChange }: SidebarProviderProps) {
  // Get initial sidebar state from cookie or fall back to defaultOpen
  const getInitialOpenState = React.useCallback((): boolean => {
    const cookieValue = getCookieValue(SIDEBAR_COOKIE_NAME);
    return cookieValue === "true" || cookieValue === "false" ? cookieValue === "true" : defaultOpen;
  }, [defaultOpen]);

  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = React.useState(getInitialOpenState);
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;

  // Update sidebar state and persist to cookie
  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newOpenState = typeof value === "function" ? value(open) : value;
      if (onOpenChange) {
        onOpenChange(newOpenState);
      } else {
        setInternalOpen(newOpenState);
      }
      setCookie(SIDEBAR_COOKIE_NAME, String(newOpenState), SIDEBAR_COOKIE_MAX_AGE);
    },
    [open, onOpenChange]
  );

  // Toggle sidebar between open and closed states
  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  // Set up keyboard shortcut (Cmd/Ctrl + S) to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => { window.removeEventListener("keydown", handleKeyDown); };
  }, [toggleSidebar]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({ state: open ? "expanded" : "collapsed", open, setOpen, toggleSidebar }),
    [open, setOpen, toggleSidebar]
  );

  // eslint-disable-next-line react-x/no-context-provider
  return <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>;
}
