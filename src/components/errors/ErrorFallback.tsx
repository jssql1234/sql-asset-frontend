import type { FallbackProps } from "react-error-boundary";
import { isAppError } from "@/types/errors";

export default function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const msg: string =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const isChunkError = /Loading chunk|chunk load|dynamically imported module/i.test(msg);
  const app = isAppError(error) ? error : undefined;
  const showRetry = app ? app.severity === "recoverable" : !isChunkError;
  return (
    <div className="p-4 border rounded bg-surface text-onSurface">
      <div className="font-semibold mb-1">Something went wrong.</div>
      {msg && (
        <div className="text-sm text-onSurfaceVariant mb-3 truncate" title={msg}>
          {msg}
        </div>
      )}
      <div className="flex gap-2">
        {showRetry && (
          <button
            type="button"
            className="px-3 py-1 rounded bg-primary text-onPrimary"
            onClick={resetErrorBoundary}
          >
            Try again
          </button>
        )}
        <button
          type="button"
          className="px-3 py-1 rounded border"
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload
        </button>
      </div>
    </div>
  );
}
