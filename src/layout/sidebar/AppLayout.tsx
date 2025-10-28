import * as React from "react";
import { SidebarProvider } from "./SidebarContext";
import { SidebarInset, SidebarTrigger, SidebarWrapper, SidebarSeparator, SidebarBreadcrumb, type SidebarBreadcrumbItem } from "./SidebarPrimitives";
import { AppSidebar } from "./AppSidebar";
import sqlAssetLogo from "@/assets/images/sqlasset_logo1.png";

export interface AppLayoutProps { children: React.ReactNode; breadcrumbs: SidebarBreadcrumbItem[] }

export function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarWrapper>
        {/* Left sidebar */}
        <AppSidebar />

        {/* Main content area (Right side of sidebar) */}
        <SidebarInset> 

          {/* Sticky header with breadcrumbs and logo */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 px-4">
              {/* Sidebar toggle button */}
              <SidebarTrigger className="-ml-1" />
              <SidebarSeparator orientation="vertical" className="mx-0 h-6 w-px" />
              <SidebarBreadcrumb items={breadcrumbs} />
            </div>

            <div className="px-4">
              <img src={sqlAssetLogo} alt="SQL Asset Logo" className="h-8 w-auto object-contain" />
            </div>
          </header>

          {/* Page content */}
          <main className="flex flex-1 flex-col gap-4 p-4 pt-4"> {children}</main>
        </SidebarInset>
      </SidebarWrapper>
    </SidebarProvider>
  );
}
