import * as React from "react";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider, SidebarSeparator, SidebarTrigger } from "./sidebar/SidebarCN";
import { AppSidebar } from "./sidebar/SidebarNav";
import sqlAssetLogo from "@/assets/images/sqlasset_logo1.png";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import ErrorFallback from "@/components/errors/ErrorFallback";
import { logError } from "@/utils/logger";
import DevErrorProbe from "@/components/dev/DevErrorProbe";

function toTitleCase(segment: string) {
  return segment
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function useBreadcrumbs() {
  const { pathname } = useLocation();
  if (!pathname || pathname === "/") return [] as { label: string; key: string }[];
  const parts = pathname.split("/").filter(Boolean);
  return parts.map((part, i) => ({
    label: toTitleCase(part),
    key: parts.slice(0, i + 1).join("/"),
  }));
}

export default function AppLayout() {
  const crumbs = useBreadcrumbs();
  const location = useLocation();

  return (
    <SidebarProvider>
      <ErrorBoundary
        FallbackComponent={() => <div className="hidden" />}
        onError={(error, info) => {
          logError(error, info, {
            scope: "sidebar",
            route: location.pathname,
            component: "AppSidebar",
          });
        }}
      >
        <AppSidebar />
      </ErrorBoundary>
      <SidebarInset>
        <ErrorBoundary
          FallbackComponent={() => (
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="px-4">
              <img src={sqlAssetLogo} alt="SQL Asset Logo" className="h-8 w-auto object-contain" />
            </div>
          </header>
          )}
          onError={(error, info) => {
            logError(error, info, {
              scope: "header",
              route: location.pathname,
              component: "Header",
            });
          }}
        >
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <SidebarSeparator orientation="vertical" className="mx-0 h-6 w-px bg-sidebar-border" />
              {crumbs.length > 0 && (
                <div className="text-sm text-onSurfaceVariant hidden md:flex items-center gap-2">
                  {crumbs.map((c, index) => (
                    <React.Fragment key={c.key}>
                      {index > 0 && <span>/</span>}
                      <span>{c.label}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4">
              <img src={sqlAssetLogo} alt="SQL Asset Logo" className="h-8 w-auto object-contain" />
            </div>
          </header>
        </ErrorBoundary>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          <ErrorBoundary
            resetKeys={[location.pathname]}
            FallbackComponent={ErrorFallback}
            onError={(error, info) => {
              logError(error, info, {
                scope: "route",
                route: location.pathname,
                component: "Outlet",
              });
            }}
          >
            <Suspense fallback={null}>
              <DevErrorProbe />
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
