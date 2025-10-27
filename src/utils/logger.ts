export interface ErrorContext {
  scope?: string;
  route?: string;
  component?: string;
  [key: string]: unknown;
}

type LogLevel = "info" | "warn" | "error";
interface ComponentInfo { componentStack?: string | null }

const REDACT_KEYS = new Set([
  "password",
  "token",
  "authorization",
  "cookie",
  "apiKey",
  "secret",
]);

const recentErrorCache = new Map<string, number>();

function now() {
  return Date.now();
}

function shouldLog(signature: string, windowMs = 10_000): boolean {
  const t = now();
  const last = recentErrorCache.get(signature) ?? 0;
  if (t - last < windowMs) return false;
  recentErrorCache.set(signature, t);
  return true;
}

function serializeError(err: unknown): Record<string, unknown> {
  try {
    if (err instanceof Error) {
      return {
        name: err.name,
        message: err.message,
        stack: err.stack,
      };
    }
    if (typeof err === "string") return { message: err };
    return { value: err };
  } catch {
    return { message: "<unserializable error>" };
  }
}

function redact(obj: unknown): unknown {
  try {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map((v) => redact(v));
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = REDACT_KEYS.has(k) ? "<redacted>" : redact(v);
    }
    return out;
  } catch {
    return undefined;
  }
}

function log(level: LogLevel, error: unknown, info?: ComponentInfo, context?: ErrorContext) {
  try {
    if (level === "info" && import.meta.env.PROD) return; // env gating

    const safeError = serializeError(error);
    const safeContext = context ? redact(context) : undefined;

    const getCtxString = (ctx: unknown, key: string): string | undefined => {
      if (!ctx || typeof ctx !== "object") return undefined;
      const val = (ctx as Record<string, unknown>)[key];
      return typeof val === "string" ? val : undefined;
    };

    const signature = [
      safeError.message,
      getCtxString(safeContext, "scope"),
      getCtxString(safeContext, "component"),
      getCtxString(safeContext, "route"),
    ]
      .filter(Boolean)
      .join("|");

    if (level === "error" && !shouldLog(signature)) return; // de-dupe errors in a small window

    const payload: Record<string, unknown> = {
      level,
      error: safeError,
    };
    if (info?.componentStack) payload.componentStack = info.componentStack;
    if (safeContext) payload.context = safeContext;

    if (level === "error") console.error("[App]", payload);
    else if (level === "warn") console.warn("[App]", payload);
    else console.info("[App]", payload);
  } catch {
    // never let logging throw
  }
}

export function logError(error: unknown, info?: ComponentInfo, context?: ErrorContext): void {
  log("error", error, info, context);
}

export function logWarn(message: unknown, context?: ErrorContext): void {
  log("warn", typeof message === "string" ? new Error(message) : message, undefined, context);
}

export function logInfo(message: unknown, context?: ErrorContext): void {
  log("info", typeof message === "string" ? new Error(message) : message, undefined, context);
}
