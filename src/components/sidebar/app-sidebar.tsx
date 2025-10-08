"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Calculator, LayoutDashboard, Calendar, Wrench, Clock, Shield, Activity, FileStack, Home, MoreHorizontal, ArrowRightLeft } from "lucide-react"

import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "./sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./shared-components"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navigationSections: [
    {
      title: "Tax Computation",
      items: [
        {
          name: "Process CA",
          url: "/process-ca",
          icon: Calculator,
        },
        {
          name: "Asset Disposal",
          url: "/disposal",
          icon: FileStack,
        },
      ],
    },
    {
      title: "Asset Maintenance",
      items: [
        {
          name: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Allocation",
          url: "/allocation",
          icon: ArrowRightLeft,
        },
        {
          name: "Downtime Tracking",
          url: "/downtime-tracking",
          icon: Clock,
        },
        {
          name: "Work Requests",
          url: "/work-request",
          icon: Wrench,
        },
        {
          name: "Maintenance Schedule",
          url: "/maintenance-schedule",
          icon: Calendar,
        },
        {
          name: "Insurance & Warranty",
          url: "/insurance",
          icon: Shield,
        },
        {
          name: "Meter Reading",
          url: "/meter-reading",
          icon: Activity,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              onClick={() => navigate('/asset')}
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Home className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium group-data-[collapsible=icon]:hidden">SQL Asset</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects navigationSections={data.navigationSections} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
                >
                  <span className="group-data-[collapsible=icon]:hidden">Tools</span>
                  <MoreHorizontal className="ml-auto size-4 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem>Maintain Asset Group</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Maintain User Group</DropdownMenuItem>
                  <DropdownMenuItem>Maintain User</DropdownMenuItem>
                  <DropdownMenuItem>User Access Right Assignment</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>Maintain Location</DropdownMenuItem>
                  <DropdownMenuItem>Maintain Department</DropdownMenuItem>
                  <DropdownMenuItem>Maintain Customer</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>Maintain Spare Part</DropdownMenuItem>
                  <DropdownMenuItem>Maintain Service Provider</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Asset History</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
