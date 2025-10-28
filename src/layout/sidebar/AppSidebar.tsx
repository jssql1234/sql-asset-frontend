import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HomeFilled, Dots, User } from "@/assets/icons";
import { Bell, ChevronsUpDown, LogOut, Settings } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarGroup, SidebarGroupTitle, SidebarSeparator, SidebarGroupItem, SidebarUserInfo } from "./SidebarPrimitives";
import { navigationSections, mockUser, toolsMenuRoutes } from "./SidebarConstant";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/components/DropdownButton";
import type { SidebarProps } from "./SidebarPrimitives";
import { useUserContext } from "@/context/UserContext";

export function AppSidebar(props: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { users, currentUser, setCurrentUser } = useUserContext();
  
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header - Home page */}
      <SidebarHeader>
        <SidebarMenuButton size="lg">
          <Link to="/asset" className="flex w-full items-center gap-2 group-data-[collapsible=icon]:gap-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <HomeFilled className="size-4" />
            </div>
            <span className="truncate font-medium group-data-[collapsible=icon]:hidden">SQL Asset</span>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>

      {/* Body - All module pages*/}
      <SidebarContent>
        {navigationSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {sectionIndex > 0 && <SidebarSeparator className="group-data-[collapsible=icon]:block hidden mx-2 my-1" />}
            
            <SidebarGroup className="p-0">
              <SidebarGroupTitle>{section.title}</SidebarGroupTitle>
              <SidebarGroupItem items={section.items} pathname={location.pathname} />
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>
      
      {/* Footer - Tools dropdown, profile dropdown, and switch user toggle(temporary) */}
      <SidebarFooter>
        <DropdownMenu className="w-full">
          <DropdownMenuTrigger>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
              <User className="h-4 w-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Switch User</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-58 rounded-3xl border border-border" defaultAlignment="right" matchTriggerWidth={false} disablePortal={true}>
            {users.map((user) => (
              <DropdownMenuItem key={user.id} onClick={() => { setCurrentUser(user); }} className={currentUser?.id === user.id ? "bg-sidebar-accent" : ""}>{user.name} ({user.email})</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu className="w-full">
          <DropdownMenuTrigger>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
              <span className="group-data-[collapsible=icon]:hidden">Tools</span>
              <Dots className="ml-auto size-4 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-58 rounded-3xl border border-border" defaultAlignment="right" matchTriggerWidth={false} disablePortal={true}>
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.assetGroup)}>Maintain Asset Group</DropdownMenuItem>
            <SidebarSeparator />
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.userGroup)}>Maintain User Group</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.user)}>Maintain User</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.userAccessRights)}>User Access Right Assignment</DropdownMenuItem>
            <SidebarSeparator />
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.location)}>Maintain Location</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.department)}>Maintain Department</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.customer)}>Maintain Customer</DropdownMenuItem>
            <SidebarSeparator />
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.sparePart)}>Maintain Spare Part</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.serviceProvider)}>Maintain Service Provider</DropdownMenuItem>
            <SidebarSeparator />
            <DropdownMenuItem onClick={() => void navigate(toolsMenuRoutes.assetHistory)}>Asset History</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu className="w-full">
          <DropdownMenuTrigger>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
              <User className="h-4 w-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
              <SidebarUserInfo name={mockUser.name} email={mockUser.email} className="flex-1 group-data-[collapsible=icon]:hidden" />
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="min-w-56 rounded-3xl border border-border/50" defaultAlignment="right" matchTriggerWidth={false}>
            <SidebarUserInfo name={mockUser.name} email={mockUser.email} className="px-3 py-2" />
            <SidebarSeparator />
            <DropdownMenuItem className="flex items-center gap-2"><Settings className="size-4" /><span>Settings</span></DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2"><Bell className="size-4" /><span>Notifications</span></DropdownMenuItem>
            <SidebarSeparator />
            <DropdownMenuItem className="flex items-center gap-2"><LogOut className="size-4" /><span>Log out</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
