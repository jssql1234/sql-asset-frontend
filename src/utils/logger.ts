export interface ErrorContext {
  scope?: string;
  route?: string;
  component?: string;
  [key: string]: unknown;
}

// Centralized error logger. Console for now; can plug external services later.
export function logError(
  error: unknown,
  info?: { componentStack?: string },
  context?: ErrorContext
): void {
  try {
    // Keep log structure stable for easier parsing in tools
    // Only include defined fields to avoid noisy output
    const payload: Record<string, unknown> = {
      level: "error",
      error,
    };
    if (info?.componentStack) payload.componentStack = info.componentStack;
    if (context) payload.context = context;
    console.error("[App]", payload);
    // TODO: integrate with a remote logging provider (e.g., Sentry/Logtail)
  } catch {
    // no-op: never let logging throw
  }
}
