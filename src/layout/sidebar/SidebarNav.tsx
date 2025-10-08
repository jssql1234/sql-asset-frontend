import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calculator, LayoutDashboard, Calendar, Wrench, Clock, Shield, Activity, FileStack, Home, MoreHorizontal, ArrowRightLeft } from "lucide-react";
import { ProfileDropdown } from "./ProfileDropdown";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarGroup, SidebarGroupLabel } from "./SidebarCN";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./SidebarHelper";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
  },
  navigationSections: [
    {
      title: "Tax Computation",
      items: [
        { name: "Process CA", url: "/process-ca", icon: Calculator },
        { name: "Asset Disposal", url: "/disposal", icon: FileStack },
      ],
    },
    {
      title: "Asset Maintenance",
      items: [
        { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { name: "Allocation", url: "/allocation", icon: ArrowRightLeft },
        { name: "Downtime Tracking", url: "/downtime-tracking", icon: Clock },
        { name: "Work Requests", url: "/work-request", icon: Wrench },
        { name: "Maintenance Schedule", url: "/maintenance-schedule", icon: Calendar },
        { name: "Insurance & Warranty", url: "/insurance", icon: Shield },
        { name: "Meter Reading", url: "/meter-reading", icon: Activity },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="SQL Asset"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Link to="/asset" className="flex w-full items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium group-data-[collapsible=icon]:hidden">
                    SQL Asset
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navigationSections.map((section) => (
          <React.Fragment key={section.title}>
            <SidebarGroup className="p-0">
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarMenu className="gap-0 px-2">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(`${item.url}/`));
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.name}
                        isActive={isActive}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-2"
                          aria-current={isActive ? "page" : undefined}
                        >
                          <item.icon className="size-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu className="w-full">
              <DropdownMenuTrigger className="w-full">
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
                >
                  <span className="group-data-[collapsible=icon]:hidden">
                    Tools
                  </span>
                  <MoreHorizontal className="ml-auto size-4 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-58 rounded-lg"
                defaultAlignment="right"
                matchTriggerWidth={false}
                disablePortal={true}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/maintain-asset-group")}>
                    Maintain Asset Group
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/maintain-user-group")}>
                    Maintain User Group
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/maintain-user")}>
                    Maintain User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/user-access-rights")}>
                    User Access Right Assignment
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/maintain-location")}>
                    Maintain Location
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/maintain-department")}>
                    Maintain Department
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/maintain-customer")}>
                    Maintain Customer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/maintain-spare-part")}>
                    Maintain Spare Part
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/maintain-service-provider")}>
                    Maintain Service Provider
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/asset-history")}>
                  Asset History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <ProfileDropdown user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}