import * as React from "react"
import type { SidebarContextProps } from "./sidebar-types"

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

export { SidebarContext }