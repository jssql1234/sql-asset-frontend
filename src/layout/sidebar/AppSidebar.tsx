import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HomeFilled, Dots, User } from "@/assets/icons";
import { Bell, ChevronsUpDown, LogOut, Settings, Shuffle } from "lucide-react";
import { Sidebar, SidebarBody, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarGroup, SidebarGroupTitle, SidebarSeparator, SidebarGroupItem, SidebarUserInfo, SidebarMenuButtonWithTooltip } from "./SidebarPrimitives";
import { navigationSections, mockUser, toolsMenuItems } from "./SidebarConstant";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/components/DropdownButton";
import type { SidebarProps } from "./SidebarPrimitives";
import { useUserContext } from "@/context/UserContext";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/utils/utils";

export function AppSidebar(props: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { users, currentUser, setCurrentUser } = useUserContext();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const collapsedMenuShiftClass = isCollapsed ? "translate-x-2" : undefined;
  
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header - Asset home page with home icon */}
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          type="button"
          onClick={() => { void navigate("/asset"); }}
          className="flex w-full items-center gap-2 group-data-[collapsible=icon]:gap-0"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <HomeFilled className="size-4" />
          </div>
          <span className="truncate font-medium group-data-[collapsible=icon]:hidden">SQL Asset</span>
        </SidebarMenuButton>
      </SidebarHeader>

      {/* Body - All module pages fron tax comp and asset maintenance*/}
      <SidebarBody>
        {navigationSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {sectionIndex > 0 && <SidebarSeparator className="group-data-[collapsible=icon]:block hidden mx-2 my-1" />}
            
            <SidebarGroup className="p-0">
              <SidebarGroupTitle>{section.title}</SidebarGroupTitle>
              <SidebarGroupItem items={section.items} pathname={location.pathname} />
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarBody>
      
      {/* Footer - Notification, tools, profile dropdown, and switch user toggle(temp) */}
      <SidebarFooter>
        {/* Switch User (Temp) */}
        <DropdownMenu className="w-full">
          <DropdownMenuTrigger>
            <SidebarMenuButtonWithTooltip tooltip="Switch User">
              <SidebarMenuButton size="default" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 data-[state=open]:bg-gray-200">
                <Shuffle className="size-4 group-data-[collapsible=icon]:size-5" />
                <span className="group-data-[collapsible=icon]:hidden text-red-500">Switch User</span>
              </SidebarMenuButton>
            </SidebarMenuButtonWithTooltip>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={cn("min-w-58 rounded-lg border border-border", collapsedMenuShiftClass)} defaultAlignment="right" matchTriggerWidth={false} disablePortal={true}>
            {users.map((user) => (
              <DropdownMenuItem key={user.id} onClick={() => { setCurrentUser(user); }} className={currentUser?.id === user.id ? "bg-sidebar-accent" : ""}>{user.name} ({user.email})</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <SidebarMenuButtonWithTooltip tooltip="Notifications">
          <SidebarMenuButton
            size="default"
            onClick={() => void navigate("/notifications")}
            className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
          >
            <Bell className="size-4 group-data-[collapsible=icon]:size-5" />
            <span className="group-data-[collapsible=icon]:hidden">Notifications</span>
          </SidebarMenuButton>
        </SidebarMenuButtonWithTooltip>
        
        {/* Tools */}
        <DropdownMenu className="w-full">
          <DropdownMenuTrigger>
            <SidebarMenuButtonWithTooltip tooltip="Tools">
              <SidebarMenuButton size="default" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 data-[state=open]:bg-gray-200">
                <Dots className="size-4 group-data-[collapsible=icon]:size-5" />
                <span className="group-data-[collapsible=icon]:hidden">Tools</span>
              </SidebarMenuButton>
            </SidebarMenuButtonWithTooltip>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={cn("min-w-58 rounded-lg border border-border", collapsedMenuShiftClass)} defaultAlignment="right" matchTriggerWidth={false} disablePortal={true}>
            {toolsMenuItems.flatMap((item, index) => {
              const nodes: React.ReactNode[] = [];

              if (item.separator && index > 0) {
                nodes.push(
                  <SidebarSeparator key={`tools-separator-${item.route}`} />
                );
              }
              nodes.push(
                <DropdownMenuItem key={`tools-item-${item.route}`} onClick={() => void navigate(item.route)}>{item.label}</DropdownMenuItem>
              );
              return nodes;
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu className="w-full">
          <DropdownMenuTrigger>
            <SidebarMenuButtonWithTooltip tooltip="User Profile">
              <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:justify-center data-[state=open]:bg-gray-200">
                <User className="size-4 group-data-[collapsible=icon]:size-5" />
                <SidebarUserInfo name={mockUser.name} email={mockUser.email} className="flex-1 group-data-[collapsible=icon]:hidden" />
                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </SidebarMenuButtonWithTooltip>
          </DropdownMenuTrigger>

          <DropdownMenuContent className={cn("min-w-56 rounded-lg border border-border/50", collapsedMenuShiftClass)} defaultAlignment="right" matchTriggerWidth={false}>
            <SidebarUserInfo name={mockUser.name} email={mockUser.email} className="px-3 py-2" />
            <SidebarSeparator />
            <DropdownMenuItem className="flex items-center gap-2"><Settings className="size-4" /><span>Settings</span></DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2"><LogOut className="size-4" /><span>Log out</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
