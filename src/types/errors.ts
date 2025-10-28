export type AppErrorCode =
  | "NETWORK"
  | "VALIDATION"
  | "AUTH"
  | "NOT_FOUND"
  | "UNKNOWN";

export type AppErrorSeverity = "recoverable" | "fatal";

export interface AppError extends Error {
  code: AppErrorCode;
  severity: AppErrorSeverity;
  displayMessage?: string;
  cause?: unknown;
}

export function createAppError(
  message: string,
  code: AppErrorCode = "UNKNOWN",
  severity: AppErrorSeverity = "recoverable",
  extras?: Partial<Pick<AppError, "displayMessage" | "cause">>
): AppError {
  const err = new Error(message) as AppError;
  err.code = code;
  err.severity = severity;
  if (extras?.displayMessage) err.displayMessage = extras.displayMessage;
  if (extras && "cause" in extras) err.cause = extras.cause;
  return err;
}

export function isAppError(e: unknown): e is AppError {
  if (typeof e !== "object" || e === null) return false;
  const rec = e as Record<string, unknown>;
  const code = rec.code;
  const severity = rec.severity;
  const isSeverity = severity === "recoverable" || severity === "fatal";
  return typeof code === "string" && isSeverity;
}
