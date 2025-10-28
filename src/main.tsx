import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { logError } from "@/utils/logger";
import "@/i18n";

if (import.meta.env.DEV) {
  import("@/styles/index").catch((err: unknown) => {
    console.warn("Failed to load deferred styles:", err);
  });
} else {
  void import("@/styles/index");
}

declare global {
  interface Window {
    __appGlobalHandlers?: boolean;
  }
}

// Register once to avoid duplicate handlers during HMR
if (!window.__appGlobalHandlers) {
  window.__appGlobalHandlers = true;

  window.addEventListener("error", (e: Event) => {
    const errEvt = e as ErrorEvent;
    const err: unknown = errEvt.error ?? new Error(errEvt.message);
    logError(err, undefined, {
      scope: "global",
      component: "window",
      route: window.location.pathname,
      filename: errEvt.filename,
      lineno: errEvt.lineno,
      colno: errEvt.colno,
    });
  });

  window.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
    logError(e.reason, undefined, {
      scope: "global",
      component: "promise",
      route: window.location.pathname,
    });
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
