"use client"

import { Link, useLocation } from "react-router-dom"
import { type LucideIcon } from "lucide-react"

import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./sidebar"

const isPathActive = (currentPath: string, targetPath: string) => {
  if (targetPath === "/") {
    return currentPath === targetPath
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

export function NavProjects({
  navigationSections,
}: {
  navigationSections: {
    title: string
    items: {
      name: string
      url: string
      icon: LucideIcon
    }[]
  }[]
}) {
  const location = useLocation()

  return (
    <>
      {navigationSections.map((section) => (
        <SidebarGroup key={section.title} className="p-0">
          <SidebarGroupLabel className="px-2 py-2">{section.title}</SidebarGroupLabel>
          <SidebarMenu className="gap-0 px-2">
            {section.items.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isPathActive(location.pathname, item.url)}
                >
                  <Link to={item.url} className="flex items-center gap-2">
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
