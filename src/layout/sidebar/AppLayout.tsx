import * as React from "react";
import { SidebarProvider } from "./SidebarContext";
import { SidebarInset, SidebarTrigger, SidebarWrapper } from "./SidebarPrimitives";
import { AppSidebar } from "./AppSidebar";
import { NotificationBell } from "@/features/notification/components/NotificationBell";

export interface AppLayoutProps { children: React.ReactNode }

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarWrapper>
        {/* Actual sidebar */}
        <AppSidebar />
        {/* Main content area (Right side of sidebar) */}
        <SidebarInset>
          {/* Fixed header with menu icon and notification bell */}
          <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear z-10">
            <div className="flex flex-1 items-center gap-2 px-4 min-w-0">
              <SidebarTrigger className="-ml-1 shrink-0" />
            </div>

            <div className="px-4 shrink-0">
              <NotificationBell />
            </div>
          </header>

          {/* Page content - scrollable container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <main className="flex flex-col gap-4 p-4 pt-4 min-w-fit">{children}</main>
          </div>
        </SidebarInset>
      </SidebarWrapper>
    </SidebarProvider>
  );
}
