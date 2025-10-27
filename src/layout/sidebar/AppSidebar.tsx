// Main sidebar component that renders the navigation menu, tools dropdown, and user profile section.
import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HomeFilled, Dots, User } from "@/assets/icons";
import { ProfileDropdown } from "./ProfileDropdown";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarSeparator } from "./SidebarPrimitives";
import { navigationSections, mockUser, toolsMenuRoutes } from "./SidebarConstant";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/components/DropdownButton";
import { SidebarMenuButtonWithTooltip } from "./SidebarTooltip";
import type { SidebarProps } from "./SidebarPrimitives";
import { cn } from "@/utils/utils";
import { useUserContext } from "@/context/UserContext";

// Dropdown menu separator component
const DropdownMenuSeparator = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("mx-3 my-1 h-px bg-onSurfaceVariant", className)} role="separator" {...props} />
);

// Dropdown menu group component
const DropdownMenuGroup = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex flex-col gap-1", className)} role="group" {...props} />
);

// Check if a given path is active based on current location
function isPathActive(url: string, pathname: string): boolean {
  if (pathname === url) return true;
  if (url !== "/" && pathname.startsWith(`${url}/`)) return true;
  return false;
}

// Renders the main navigation sidebar with sections, tools menu, and profile
export function AppSidebar(props: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { users, currentUser, setCurrentUser } = useUserContext();

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header with home/logo link */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
            >
              <Link
                to="/asset"
                className="flex w-full items-center gap-2 group-data-[collapsible=icon]:gap-0"
              >
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

      {/* Main navigation content */}
      <SidebarContent>
        {navigationSections.map((section, sectionIndex) => (
          <React.Fragment key={section.title}>
            {/* Separator between sections (only visible when collapsed) */}
            {sectionIndex > 0 && (
              <SidebarSeparator className="group-data-[collapsible=icon]:block hidden mx-2 my-1" />
            )}

            {/* Navigation section */}
            <SidebarGroup className="p-0">
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarMenu className="gap-0 px-2">
                {section.items.map((item) => {
                  const isActive = isPathActive(item.url, location.pathname);
                  const Icon = isActive ? item.filledIcon : item.icon;

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButtonWithTooltip tooltip={item.name}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link
                            to={item.url}
                            className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                            aria-current={isActive ? "page" : undefined}
                          >
                            <Icon className="size-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuButtonWithTooltip>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* Footer with tools menu and profile */}
      <SidebarFooter>
        {/* Switch User dropdown menu */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu className="w-full">
              <DropdownMenuTrigger className="w-full">
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
                >
                  <User className="h-4 w-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    Switch User
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-58 rounded-3xl border border-border"
                defaultAlignment="right"
                matchTriggerWidth={false}
                disablePortal={true}
              >
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
        </SidebarMenu>

        {/* Tools dropdown menu */}
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
                  <Dots className="ml-auto size-4 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-58 rounded-3xl border border-border"
                defaultAlignment="right"
                matchTriggerWidth={false}
                disablePortal={true}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => void navigate(toolsMenuRoutes.assetGroup)}
                  >
                    Maintain Asset Group
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void navigate(toolsMenuRoutes.userGroup)}
                  >
                    Maintain User Group
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void navigate(toolsMenuRoutes.user)}
                  >
                    Maintain User
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      void navigate(toolsMenuRoutes.userAccessRights)
                    }
                  >
                    User Access Right Assignment
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void navigate(toolsMenuRoutes.location)}
                  >
                    Maintain Location
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void navigate(toolsMenuRoutes.department)}
                  >
                    Maintain Department
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void navigate(toolsMenuRoutes.customer)}
                  >
                    Maintain Customer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void navigate(toolsMenuRoutes.sparePart)}
                  >
                    Maintain Spare Part
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      void navigate(toolsMenuRoutes.serviceProvider)
                    }
                  >
                    Maintain Service Provider
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void navigate(toolsMenuRoutes.assetHistory)}
                >
                  Asset History
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* User profile dropdown */}
        <ProfileDropdown user={mockUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
