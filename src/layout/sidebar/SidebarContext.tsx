/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { SIDEBAR_COOKIE_NAME, SIDEBAR_COOKIE_MAX_AGE, SIDEBAR_KEYBOARD_SHORTCUT } from "./SidebarConstant";

// Sidebar state management context
interface SidebarContextValue {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

// Get a cookie value by name 
function getCookieValue(name: string): string | null {   
  if (typeof document === "undefined") {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() ?? null;
  }
  
  return null;
}

// Set a cookie with name, value, and max age
function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${value}; path=/; max-age=${String(maxAge)}`;
}

// Parse boolean from cookie string value
function parseBooleanCookie(value: string | null): boolean | null {
  if (value === null) {
    return null;
  }
  
  return value === "true";
}

// Sidebar context for sharing state across components
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

// Hook to access sidebar context
export function useSidebar(): SidebarContextValue {
  // eslint-disable-next-line react-x/no-use-context
  const context = React.useContext(SidebarContext);
  
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// Props for SidebarProvider component
export interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}

/* 
Provider component for sidebar context
Manages sidebar state and persistence
*/
export function SidebarProvider({
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
}: SidebarProviderProps) {
  // Initialize sidebar state from cookie or default
  const getInitialOpenState = React.useCallback((): boolean => {
    const cookieValue = getCookieValue(SIDEBAR_COOKIE_NAME);
    const parsedValue = parseBooleanCookie(cookieValue);
    return parsedValue ?? defaultOpen;
  }, [defaultOpen]);

  const [internalOpen, setInternalOpen] = React.useState(getInitialOpenState);
  
  // Use controlled value if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;

  // Sync internal state when defaultOpen changes for uncontrolled usage
  React.useEffect(() => {
    if (controlledOpen === undefined) {
      setInternalOpen(defaultOpen);
      setCookie(SIDEBAR_COOKIE_NAME, String(defaultOpen), SIDEBAR_COOKIE_MAX_AGE);
    }
  }, [controlledOpen, defaultOpen]);

  // Update sidebar open state and persist to cookie
  const setOpen = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newOpenState = typeof value === "function" ? value(open) : value;
      
      // Update controlled or internal state
      if (onOpenChange) {
        onOpenChange(newOpenState);
      } else {
        setInternalOpen(newOpenState);
      }

      // Persist to cookie
      setCookie(
        SIDEBAR_COOKIE_NAME,
        String(newOpenState),
        SIDEBAR_COOKIE_MAX_AGE
      );
    },
    [open, onOpenChange]
  );

  // Toggle sidebar between open and closed
  const toggleSidebar = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, [setOpen]);

  // Set up keyboard shortcut (Cmd/Ctrl + B)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar]);

  // Compute state string for data attributes
  const state = open ? "expanded" : "collapsed";

  // Memoize context value
  const contextValue = React.useMemo<SidebarContextValue>(
    () => ({
      state,
      open,
      setOpen,
      toggleSidebar,
    }),
    [state, open, setOpen, toggleSidebar]
  );

  return (
    // eslint-disable-next-line react-x/no-context-provider
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}
