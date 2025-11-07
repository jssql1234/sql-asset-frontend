import * as React from "react";
import { SidebarProvider } from "./SidebarContext";
import { SidebarInset, SidebarTrigger, SidebarWrapper, SidebarSeparator, SidebarBreadcrumb } from "./SidebarPrimitives";
import { AppSidebar } from "./AppSidebar";
import { NotificationBell } from "@/features/notification/components/NotificationBell";

export interface AppLayoutProps { children: React.ReactNode; breadcrumbs: { label: string }[] }

export function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarWrapper>
        {/* Actual sidebar */}
        <AppSidebar />  
        {/* Main content area (Right side of sidebar) */}
        <SidebarInset>  
          
          {/* Sticky header with menu icon, breadcrumbs, and notification bell */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <SidebarSeparator orientation="vertical" className="mx-0 h-6 w-px" />
              <SidebarBreadcrumb items={breadcrumbs} />
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
