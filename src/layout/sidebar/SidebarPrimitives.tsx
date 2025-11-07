import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Separator as SeparatorPrimitive } from "@radix-ui/react-separator";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/components";
import { useSidebar } from "./SidebarContext";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "./SidebarConstant";

//Define CSS for sidebar dimensions.
function SidebarWrapper({ className, style, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-wrapper"
      style={ { "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-collapsed-width": SIDEBAR_COLLAPSED_WIDTH, ...style } as React.CSSProperties }
      className={cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full overflow-x-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

//Main content area sits next to the sidebar.
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main 
      data-slot="sidebar-inset" 
      className={cn(
        "bg-background relative flex flex-1 flex-col min-w-0",
        className
      )} 
      {...props}
    />
  );
}

//Menu icon to open/close sidebar.
function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button data-sidebar="trigger" data-slot="sidebar-trigger" variant="ghost" size="icon" className={cn("size-9", className)} onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
    </Button>
  );
}

export interface SidebarSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive> {
  orientation?: "horizontal" | "vertical";
}

//Horizontal/vertical Line divider.
function SidebarSeparator({ className, orientation = "horizontal", ...props }: SidebarSeparatorProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isFocused, index, onHover, ...validProps } = props as Record<string, unknown>;
  
  return (
    <SeparatorPrimitive data-slot="sidebar-separator" data-sidebar="separator" orientation={orientation} className={cn(
        "bg-onSurfaceVariant shrink-0",
        orientation === "horizontal" ? "h-px w-auto mx-2" : "h-6 w-px mx-0",
        className
      )}
      {...validProps}
    />
  );
}

//Props for Sidebar root component (Supports icon collapsible mode with left positioning).
export interface SidebarProps extends React.ComponentProps<"div"> { collapsible?: "icon" }

//Main sidebar container with responsive behavior(Fixed to left side with icon collapsible mode).
function Sidebar({ collapsible = "icon", className, children, ...props }: SidebarProps) {
  const { state } = useSidebar();

  return (
    <div className="group peer text-sidebar-foreground hidden md:block" 
         data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-slot="sidebar">
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
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear",
           "md:flex left-0 group-data-[collapsible=icon]:w-(--sidebar-collapsed-width) border-r border-gray-200",
          className
        )}
        {...props}
      >
        <div data-sidebar="sidebar" data-slot="sidebar-inner" className="bg-sidebar flex h-full w-full flex-col">{children}</div>
      </div>
    </div>
  );
}

//Sidebar header (within sidebar).
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-header" data-sidebar="header" className={cn("flex flex-col gap-2 px-3 py-2 group-data-[collapsible=icon]:px-0", className)} {...props}/>
  );
}

//Tax computation and Asset Maintenance modules.
function SidebarBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-body" data-sidebar="body" className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto px-2 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:px-0",
        className
      )}
      {...props}
    />
  );
}

//Sidebar footer.
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-footer" data-sidebar="footer" className={cn("flex flex-col gap-2 px-3 py-2 group-data-[collapsible=icon]:px-0", className)} {...props}/>
  );
}

//Tax computation group and asset maintenance group.
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-group" data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col px-3 py-2 group-data-[collapsible=icon]:px-0", className)} {...props}/>
  );
}

//Sidebar group title.
function SidebarGroupTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-group-title" data-sidebar="group-title" className={cn(
        `text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-3
        text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear
        focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:px-0`,
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
  items: { name: string; url?: string; icon: React.ComponentType<{ className?: string }>; filledIcon?: React.ComponentType<{ className?: string }>; onClick?: () => void }[];
  pathname?: string;
}

//Renders navigation items within a sidebar group (supports both navigation and custom click handlers).
function SidebarGroupItem({ items, pathname }: SidebarGroupItemProps) {
  const navigate = useNavigate();

  return (
  <div className="flex w-full min-w-0 flex-col gap-1 px-3 group-data-[collapsible=icon]:px-0">
      {items.map((item) => {
        const isActive = pathname && item.url ? isPathActive(item.url, pathname) : false;
        const Icon = isActive && item.filledIcon ? item.filledIcon : item.icon;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const handleClick = item.onClick ?? (item.url ? () => { void navigate(item.url!); } : undefined);

        return (
          <SidebarMenuButtonWithTooltip key={item.name} tooltip={item.name}>
            <SidebarMenuButton
              isActive={isActive}
              type="button"
              onClick={handleClick}
              aria-current={isActive ? "page" : undefined}
              className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
            >
              <Icon className="size-4 group-data-[collapsible=icon]:size-5" />
              <span className={cn(
                "group-data-[collapsible=icon]:hidden",
                (item.name === "Process CA" || item.name === "Asset Disposal") && "text-red-500"
              )}>
                {item.name}
              </span>
            </SidebarMenuButton>
          </SidebarMenuButtonWithTooltip>
        );
      })}
    </div>
  );
}

//Sidebar menu button style variants.
const sidebarMenuButtonVariants = cva(
  [
    "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden",
    "ring-sidebar-ring transition-[width,height,padding]",
    "hover:bg-gray-200 hover:text-sidebar-accent-foreground",
    "focus-visible:ring-2 active:bg-gray-100 active:text-sidebar-accent-foreground",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "data-[active=true]:bg-gray-300 data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground",
    "data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground",
  "group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! group-data-[collapsible=icon]:mx-auto",
    "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:[&>svg]:size-5!",
  ].join(" "),
  {
    variants: {
      size: { default: "h-8 text-sm", sm: "h-7 text-xs", lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!" },
    },
    defaultVariants: { size: "default" },
  }
);

export interface SidebarMenuButtonProps extends React.ComponentProps<"button">, VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean; isActive?: boolean; children?: React.ReactNode;
}

//For asset mainpage, tools, notifications, and user profile. 
function SidebarMenuButton({ asChild = false, isActive = false, size = "default", className, ...props }: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp data-slot="sidebar-menu-button" data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({ size }), className)} {...props}/>
  );
}

export interface SidebarMenuButtonWithTooltipProps extends React.HTMLAttributes<HTMLDivElement> { tooltip?: string; children: React.ReactElement }

//Shows tooltip when hover in collapsed sidebar.
function SidebarMenuButtonWithTooltip({ tooltip, children, className, onMouseEnter, onMouseLeave, ...props }: SidebarMenuButtonWithTooltipProps) {
  const { state } = useSidebar();
  const [showTooltip, setShowTooltip] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isCollapsed = Boolean(tooltip) && state === "collapsed";

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => { if (isCollapsed) setShowTooltip(true); onMouseEnter?.(event) };
  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => { if (isCollapsed) setShowTooltip(false); onMouseLeave?.(event) };

  const wrapperClassName = cn(isCollapsed ? "relative flex" : "contents", className);

  return (
    <div ref={containerRef} className={wrapperClassName} {...props} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {isCollapsed && showTooltip && (
        <div
          className="fixed z-[9999] bg-inverseSurface px-3 py-1.5 text-sm text-inverseOnSurface rounded-md shadow-md pointer-events-none whitespace-nowrap"
          style={{
            left: containerRef.current
              ? `${String(containerRef.current.getBoundingClientRect().right + 5)}px`
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

export { SidebarWrapper, SidebarInset, SidebarTrigger, SidebarSeparator, Sidebar, SidebarHeader, SidebarBody, SidebarFooter, SidebarGroup, SidebarGroupTitle, SidebarGroupItem, SidebarMenuButton, SidebarMenuButtonWithTooltip, SidebarUserInfo };
