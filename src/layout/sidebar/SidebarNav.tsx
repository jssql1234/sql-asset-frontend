import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calculator, CalculatorFilled, LayoutDashboard, LayoutDashboardFilled, Clock, ClockFilled, Gauge, GaugeFilled, Bin, BinFilled, HomeFilled, Dots, Location as LocationIcon, LocationFilled, ShieldCheck, ShieldCheckFilled, Calendar, CalendarFilled, Briefcase, BriefcaseFilled, User } from "@/assets/icons";
import { ProfileDropdown } from "./ProfileDropdown";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarSeparator } from "./SidebarCN";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./SidebarHelper";
import { useUserContext } from "@/context/UserContext";

const data = {
  user: { name: "Adam", email: "Adam@sql.com.my" },
  navigationSections: [
    {
      title: "Tax Computation",
      items: [
        { name: "Process CA", url: "/process-ca", icon: Calculator, filledIcon: CalculatorFilled },
        { name: "Asset Disposal", url: "/disposal", icon: Bin, filledIcon: BinFilled },
      ],
    },
    {
      title: "Asset Maintenance",
      items: [
        { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard, filledIcon: LayoutDashboardFilled },
        { name: "Allocation", url: "/allocation", icon: LocationIcon, filledIcon: LocationFilled },
        { name: "Downtime Tracking", url: "/downtime-tracking", icon: Clock, filledIcon: ClockFilled },
        { name: "Work Requests", url: "/work-request", icon: Briefcase, filledIcon: BriefcaseFilled },
        { name: "Work Orders", url: "/work-orders", icon: Calendar, filledIcon: CalendarFilled },
        { name: "Insurance & Warranty", url: "/insurance", icon: ShieldCheck, filledIcon: ShieldCheckFilled },
        { name: "Meter Reading", url: "/meter-reading", icon: Gauge, filledIcon: GaugeFilled },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();
  const { users, currentUser, setCurrentUser } = useUserContext();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            >
              <Link to="/asset" className="flex w-full items-center gap-2 group-data-[collapsible=icon]:gap-0">
                <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <HomeFilled className="size-4" />
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
        {data.navigationSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {sectionIndex > 0 && (
              <SidebarSeparator className="group-data-[collapsible=icon]:block hidden mx-2 my-1" />
            )}
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
                          className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                          aria-current={isActive ? "page" : undefined}
                        >
                          {isActive ? (
                            <item.filledIcon className="size-4" />
                          ) : (
                            <item.icon className="size-4" />
                          )}
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
                <SidebarMenuButton size="lg" className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                  <User className="h-4 w-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">Switch User</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-58 rounded-3xl border border-border" defaultAlignment="right" matchTriggerWidth={false} disablePortal={true}>
                <DropdownMenuGroup>
                  {users.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                      }}
                      className={currentUser?.id === user.id ? "bg-sidebar-accent" : ""}
                    >
                      {user.name} ({user.email})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu className="w-full">
              <DropdownMenuTrigger className="w-full">
                <SidebarMenuButton size="lg" className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
                  <span className="group-data-[collapsible=icon]:hidden">Tools</span>
                  <Dots className="ml-auto size-4 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-58 rounded-3xl border border-border" defaultAlignment="right" matchTriggerWidth={false} disablePortal={true}>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => void navigate("/maintain-asset-group")}>Maintain Asset Group</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void navigate("/maintain-user-group")}>Maintain User Group</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void navigate("/maintain-user")}>Maintain User</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void navigate("/user-access-rights")}>User Access Right Assignment</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void navigate("/maintain-location")}>Maintain Location</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void navigate("/maintain-department")}>Maintain Department</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void navigate("/maintain-customer")}>Maintain Customer</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void navigate("/maintain-spare-part")}>Maintain Spare Part</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void navigate("/maintain-service-provider")}>Maintain Service Provider</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void navigate("/asset-history")}>Asset History</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <ProfileDropdown user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}