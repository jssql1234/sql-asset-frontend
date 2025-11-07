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

          {/* Sticky header with menu icon and notification bell */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              {/* <img src="/src/assets/images/sqlasset_logo1.png" alt="SQL Asset Logo" className="h-8 w-auto pl-3"/> */}
            </div>

            <div className="px-4">
              <NotificationBell />
            </div>
          </header>

          {/* Page content */}
          <main className="flex flex-1 flex-col gap-4 p-4 pt-4"> {children}</main>
        </SidebarInset>
      </SidebarWrapper>
    </SidebarProvider>
  );
}
