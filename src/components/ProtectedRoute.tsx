import { useEffect, type ReactNode, isValidElement, type JSXElementConstructor } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteFallbackProps {
  children: ReactNode;
}

export function ProtectedRouteFallback({ children }: ProtectedRouteFallbackProps) {
  return <>{children}</>;
}

ProtectedRouteFallback.displayName = "ProtectedRouteFallback";

interface ProtectedRouteProps {
  /** The condition that must be true for access */
  when: boolean;

  /** Where to go if the condition fails (default: "/") */
  fallback?: string;

  /** Optional reason logging (for debugging or analytics) */
  reason?: string;

  /** The child elements - can include ProtectedRouteFallback */
  children: ReactNode;
}

function hasDisplayName<T extends object>(
  type: string | JSXElementConstructor<T>
): type is JSXElementConstructor<T> & { displayName?: string } {
  return typeof type !== "string";
}

export default function ProtectedRoute({
  when,
  fallback = "/",
  reason,
  children,
}: ProtectedRouteProps) {
  const navigate = useNavigate();

  // Find the ProtectedRouteFallback component among children
  let fallbackComponent: ReactNode | null = null;
  let componentExist = false;
  const mainContent: ReactNode[] = [];

  const childArray = Array.isArray(children) ? children : [children];

  childArray.forEach((child: ReactNode) => {
    if (!componentExist && isValidElement(child) && hasDisplayName(child.type) && child.type.displayName === "ProtectedRouteFallback") {
      fallbackComponent = child;
      componentExist = true;
    } else {
      mainContent.push(child);
    }
  });

  useEffect(() => {
    if (!when && !componentExist) {
      if (reason) console.warn(`[ProtectedRoute] Redirecting: ${reason}`);
      void navigate(fallback, { replace: true });
    }
  }, [when, fallback, reason, navigate, componentExist]);

  if (when) {
    return <>{mainContent}</>;
  } else {
    return fallbackComponent;
  }
}