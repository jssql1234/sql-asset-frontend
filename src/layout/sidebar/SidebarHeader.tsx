import * as React from "react"

interface SidebarHeaderProps {
  children: React.ReactNode
  breadcrumbs?: {
    label: string
  }[]
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  return <>{children}</>
}