import * as React from "react"
import { SidebarInset, SidebarProvider, SidebarSeparator, SidebarTrigger } from "./SidebarCN"
import { AppSidebar } from "./SidebarNav"

interface SidebarHeaderProps {
  children: React.ReactNode
  breadcrumbs?: {
    label: string
  }[]
}

export function SidebarHeader({ children, breadcrumbs }: SidebarHeaderProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex flex-1 items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <SidebarSeparator
              orientation="vertical"
              className="mx-0 h-6 w-px bg-sidebar-border"
            />
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="text-sm text-onSurfaceVariant hidden md:flex items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span>/</span>}
                    <span>{crumb.label}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          <div className="px-4">
            <img src="src/assets/images/sqlasset_logo1.png" alt="SQL Asset Logo" className="h-8 w-auto object-contain" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}