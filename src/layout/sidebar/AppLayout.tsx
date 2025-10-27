/*
Main layout component that provides the sidebar, header, and content area.
Wraps all application pages with consistent layout structure.
*/
import * as React from "react";
import { SidebarProvider } from "./SidebarContext";
import { SidebarInset, SidebarTrigger, SidebarWrapper, SidebarSeparator } from "./SidebarPrimitives";
import { AppSidebar } from "./AppSidebar";
import sqlAssetLogo from "@/assets/images/sqlasset_logo1.png";

// Breadcrumb item for navigation
export interface BreadcrumbItem { label: string }

// Props for AppLayout component
export interface AppLayoutProps { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }

/*
Application layout component 
Provides sidebar navigation and consistent page structure
*/ 
export function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <SidebarWrapper>
        {/* Sidebar navigation */}
        <AppSidebar />

        {/* Main content area */}
        <SidebarInset>
          {/* Sticky header with breadcrumbs and logo */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex flex-1 items-center gap-2 px-4">
              {/* Sidebar toggle button */}
              <SidebarTrigger className="-ml-1" />

              <SidebarSeparator
                orientation="vertical"
                className="mx-0 h-6 w-px"
              />

              {/* Breadcrumb navigation */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav
                  className="text-sm text-onSurfaceVariant hidden md:flex items-center gap-2"
                  aria-label="Breadcrumb"
                >
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.label}>
                      {index > 0 && <span aria-hidden="true">/</span>}
                      <span>{crumb.label}</span>
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>

            <div className="px-4">
              <img
                src={sqlAssetLogo}
                alt="SQL Asset Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
          </header>

          {/* Page content */}
          <main className="flex flex-1 flex-col gap-4 p-4 pt-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarWrapper>
    </SidebarProvider>
  );
}
