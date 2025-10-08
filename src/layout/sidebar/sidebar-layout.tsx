import * as React from "react"
import { Link } from "react-router-dom"
import { SidebarInset, SidebarProvider, SidebarSeparator, SidebarTrigger } from "./sidebar"
import { AppSidebar } from "./app-sidebar"

// Simple breadcrumb components
function Breadcrumb({ children }: { children: React.ReactNode }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-onSurfaceVariant">
      {children}
    </nav>
  )
}

function BreadcrumbList({ children }: { children: React.ReactNode }) {
  return <ol className="flex items-center gap-2">{children}</ol>
}

function BreadcrumbItem({ children, className }: { children: React.ReactNode, className?: string }) {
  return <li className={className}>{children}</li>
}

function BreadcrumbLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-onSurface transition-colors hover:text-primary"
    >
      {children}
    </Link>
  )
}

function BreadcrumbPage({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-medium text-onSurface" aria-current="page">
      {children}
    </span>
  )
}

function BreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <span className={`text-onSurfaceVariant ${className || ""}`} aria-hidden>
      /
    </span>
  )
}

interface SidebarLayoutProps {
  children: React.ReactNode
  breadcrumbs?: {
    label: string
    href?: string
  }[]
}

export function SidebarLayout({ children, breadcrumbs }: SidebarLayoutProps) {
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
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                      <BreadcrumbItem className="hidden md:block">
                        {crumb.href ? (
                          <BreadcrumbLink to={crumb.href}>
                            {crumb.label}
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
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