"use client"

import {
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar"

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
  return (
    <>
      {navigationSections.map((section) => (
        <SidebarGroup key={section.title} className="p-0">
          <SidebarGroupLabel className="px-2 py-2">{section.title}</SidebarGroupLabel>
          <SidebarMenu className="gap-0 px-2">
            {section.items.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}
