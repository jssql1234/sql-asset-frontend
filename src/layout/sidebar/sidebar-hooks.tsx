import * as React from "react"
import { SidebarContext } from "./sidebar-context"
import type { SidebarContextProps } from "./sidebar-types"

export function useSidebar(): SidebarContextProps {
  const context = React.use(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}