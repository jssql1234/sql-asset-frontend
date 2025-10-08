import * as React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./sidebar"
import { AppSidebar } from "./app-sidebar"
import sqlLogo from "@/assets/images/sqlasset_logo1.png"

// Simple breadcrumb components
function Breadcrumb({ children }: { children: React.ReactNode }) {
  return <nav aria-label="breadcrumb">{children}</nav>
}

function BreadcrumbList({ children }: { children: React.ReactNode }) {
  return <ol className="flex items-center gap-2 text-sm">{children}</ol>
}

function BreadcrumbItem({ children, className }: { children: React.ReactNode, className?: string }) {
  return <li className={className}>{children}</li>
}

function BreadcrumbLink({ href, children }: { href: string, children: React.ReactNode }) {
  return <a href={href} className="hover:text-foreground transition-colors">{children}</a>
}

function BreadcrumbPage({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>
}

function BreadcrumbSeparator({ className }: { className?: string }) {
  return <span className={`text-muted-foreground ${className || ''}`}>/</span>
}

function Separator({ orientation, className }: { orientation?: 'vertical' | 'horizontal', className?: string }) {
  return (
    <div 
      className={`bg-border ${orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full'} ${className || ''}`}
    />
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
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-3" />
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                      <BreadcrumbItem className="hidden md:block">
                        {crumb.href ? (
                          <BreadcrumbLink href={crumb.href}>
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
            <img src={sqlLogo} alt="SQL Asset Logo" className="h-8 w-auto object-contain" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
