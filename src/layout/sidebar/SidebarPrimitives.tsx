import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Separator as SeparatorPrimitive } from "@radix-ui/react-separator";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/components";
import { useSidebar } from "./SidebarContext";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./SidebarConstant";

//Provides CSS variables for sidebar dimensions.
function SidebarWrapper({ className, style, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-wrapper"
      style={ { "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-collapsed-width": SIDEBAR_COLLAPSED_WIDTH, ...style } as React.CSSProperties }
      className={cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

//Main content area that sits next to the sidebar.
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("bg-background relative flex w-full flex-1 flex-col", className)}
      {...props}
    />
  );
}

//Toggles the sidebar open/closed state.
function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-9", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
    </Button>
  );
}

//Props for SidebarSeparator component.
export interface SidebarSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive> {
  orientation?: "horizontal" | "vertical";
}

//Visual divider for separating sidebar sections.
function SidebarSeparator({
  className,
  orientation = "horizontal",
  ...props
}: SidebarSeparatorProps) {
  // Filter out props that are added by DropdownMenuContent's cloneElement
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isFocused, index, onHover, ...validProps } = props as Record<string, unknown>;
  
  return (
    <SeparatorPrimitive
      data-slot="sidebar-separator"
      data-sidebar="separator"
      orientation={orientation}
      className={cn(
        "bg-onSurfaceVariant shrink-0",
        orientation === "horizontal" ? "h-px w-auto mx-2" : "h-6 w-px mx-0",
        className
      )}
      {...validProps}
    />
  );
}

//Breadcrumb item for navigation.
export interface SidebarBreadcrumbItem { label: string }

//Props for SidebarBreadcrumb component.
export interface SidebarBreadcrumbProps { items: SidebarBreadcrumbItem[]; className?: string } 

//Breadcrumb navigation component for sidebar header.
function SidebarBreadcrumb({ items, className }: SidebarBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      className={cn(
        "text-sm text-onSurfaceVariant hidden md:flex items-center gap-2",
        className
      )}
      aria-label="Breadcrumb"
    >
      {items.map((crumb, index) => (
        <React.Fragment key={crumb.label}>
          {index > 0 && <span aria-hidden="true">/</span>}
          <span>{crumb.label}</span>
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Props for Sidebar root component.
 * Supports icon collapsible mode with left positioning.
 */
export interface SidebarProps extends React.ComponentProps<"div"> { collapsible?: "icon" }

/**
 * Main sidebar container with responsive behavior.
 * Fixed to left side with icon collapsible mode.
 */
function Sidebar({
  collapsible = "icon",
  className,
  children,
  ...props
}: SidebarProps) {
  const { state } = useSidebar();

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-slot="sidebar" 
    >
      {/* Sidebar gap spacer */} 
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-100 ease-linear",
          "group-data-[collapsible=icon]:w-(--sidebar-collapsed-width)"
        )}
      />
      
      {/* Sidebar container */}
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex left-0",
          "group-data-[collapsible=icon]:w-(--sidebar-collapsed-width) border-r border-gray-200",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar flex h-full w-full flex-col"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

//Sidebar header section component.
function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

//Sidebar content/main section component.
function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

//Sidebar footer section component.
function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

//Groups related menu items together.
function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

//Displays a title for a group of menu items.
function SidebarGroupTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-title"
      data-sidebar="group-title"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

//Checks if a navigation path is active based on current pathname.
function isPathActive(url: string, pathname: string): boolean {
  if (pathname === url) return true;
  if (url !== "/" && pathname.startsWith(`${url}/`)) return true;
  return false;
}

export interface SidebarGroupItemProps {
  item: { name: string; url: string; icon: React.ComponentType<{ className?: string }>; filledIcon: React.ComponentType<{ className?: string }> };
  pathname: string;
}

//Individual item within a sidebar group.
function SidebarGroupItem({ item, pathname }: SidebarGroupItemProps) {
  const isActive = isPathActive(item.url, pathname);
  const Icon = isActive ? item.filledIcon : item.icon;

  return (
    <SidebarMenuButtonWithTooltip tooltip={item.name}>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={item.url} className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0" aria-current={isActive ? "page" : undefined}>
          <Icon className="size-4" />
          <span>{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuButtonWithTooltip>
  );
}

//Sidebar menu button style variants.
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-gray-100 hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-gray-100 active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-gray-200 data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:[&>svg]:size-5!",
  {
    variants: {
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

//Props for SidebarMenuButton component.
export interface SidebarMenuButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;  
  isActive?: boolean;
}

//Interactive button for sidebar menu items.
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = "default",
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ size }), className)}
      {...props}
    />
  );
}

//Props for SidebarMenuButtonWithTooltip.
export interface SidebarMenuButtonWithTooltipProps { tooltip?: string; children: React.ReactNode }

//Wrapper that shows tooltip when sidebar is collapsed.
function SidebarMenuButtonWithTooltip({
  tooltip,
  children,
}: SidebarMenuButtonWithTooltipProps) {
  const { state } = useSidebar();
  const [showTooltip, setShowTooltip] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Don't show tooltip if not provided or sidebar is expanded
  if (!tooltip || state !== "collapsed") {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      onMouseEnter={() => { setShowTooltip(true) }}
      onMouseLeave={() => { setShowTooltip(false) }}
    >
      {children}
      {showTooltip && (
        <div
          className="fixed z-[9999] bg-inverseSurface px-3 py-1.5 text-sm text-inverseOnSurface rounded-md shadow-md pointer-events-none whitespace-nowrap"
          style={{
            left: containerRef.current
              ? `${String(containerRef.current.getBoundingClientRect().right + 12)}px`
              : "0px",
            top: containerRef.current
              ? `${String(containerRef.current.getBoundingClientRect().top)}px`
              : "0px",
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
}

//Props for SidebarUserInfo component.
export interface SidebarUserInfoProps { name: string; email: string; className?: string }

//Shows user name and email in a formatted layout.
function SidebarUserInfo({ name, email, className }: SidebarUserInfoProps) {
  return (
    <div className={cn("flex flex-col gap-1 text-left text-sm leading-tight", className)}>
      <span className="truncate font-medium">{name}</span>
      <span className="truncate text-xs text-onSurfaceVariant">{email}</span>
    </div>
  );
}

export { SidebarWrapper, SidebarInset, SidebarTrigger, SidebarSeparator, SidebarBreadcrumb, Sidebar, SidebarHeader, SidebarContent, 
         SidebarFooter, SidebarGroup, SidebarGroupTitle, SidebarGroupItem, SidebarMenuButton, SidebarMenuButtonWithTooltip, SidebarUserInfo };
