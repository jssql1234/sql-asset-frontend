import { Bell, ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/components/DropdownButton";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./SidebarPrimitives";
import * as React from "react";
import { cn } from "@/utils/utils";

// User profile information
export interface UserProfile {
  name: string;
  email: string;
}

// Custom dropdown helper components for sidebar-specific styling
const baseMenuPadding = "px-3 py-2";

// Dropdown menu label component
const DropdownMenuLabel = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn(baseMenuPadding, "label-medium-bold text-onSurface", className)} role="presentation" {...props} />
);

// Dropdown menu separator component
const DropdownMenuSeparator = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("mx-3 my-1 h-px bg-onSurfaceVariant", className)} role="separator" {...props} />
);

// Dropdown menu group component
const DropdownMenuGroup = ({ className, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex flex-col gap-1", className)} role="group" {...props} />
);

// Props for ProfileDropdown component
export interface ProfileDropdownProps {
  user: UserProfile;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onLogoutClick?: () => void;
}

export function ProfileDropdown({
  user,
  onSettingsClick,
  onNotificationsClick,
  onLogoutClick,
}: ProfileDropdownProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu className="w-full">
          <DropdownMenuTrigger className="w-full">
            <SidebarMenuButton
              size="lg"
              className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
            >
              <User className="h-4 w-4 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-3xl border border-border/50"
            defaultAlignment="right"
            matchTriggerWidth={false}
          >
            {/* User info header */}
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="label-medium-bold text-onSurface">
                {user.name}
              </span>
              <span className="body-small text-onSurfaceVariant">
                {user.email}
              </span>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* User actions */}
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={onSettingsClick}
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={onNotificationsClick}
              >
                <Bell className="size-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={onLogoutClick}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
