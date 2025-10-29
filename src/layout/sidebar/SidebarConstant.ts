import { Calculator, CalculatorFilled, LayoutDashboard, LayoutDashboardFilled, Clock, ClockFilled, Gauge, GaugeFilled, Bin, BinFilled, Location as LocationIcon, LocationFilled, ShieldCheck, ShieldCheckFilled, Calendar, CalendarFilled, Briefcase, BriefcaseFilled } from "@/assets/icons";
import type { ComponentType } from "react";

export const SIDEBAR_COOKIE_NAME = "sidebar:state" as const;  // Cookie name for persisting sidebar state
export const SIDEBAR_COOKIE_MAX_AGE = 604800;
export const SIDEBAR_WIDTH = "15rem" as const;
export const SIDEBAR_COLLAPSED_WIDTH = "3rem" as const;
export const SIDEBAR_KEYBOARD_SHORTCUT = "s" as const;
export const mockUser: UserProfile = { name: "Adam", email: "Adam@sql.com.my" };

interface NavigationSection { title: string; items: NavigationItem[] }
interface NavigationItem { name: string; url: string; icon: ComponentType<{ className?: string }>; filledIcon: ComponentType<{ className?: string }> }
interface UserProfile { name: string; email: string; }
interface ToolsMenuItem { label: string; route: string; separator?: boolean }

export const navigationSections: NavigationSection[] = [
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
];

export const toolsMenuItems: ToolsMenuItem[] = [
  { label: "Maintain Asset Group", route: "/maintain-asset-group" },
  { label: "Maintain User Group", route: "/maintain-user-group", separator: true },
  { label: "Maintain User", route: "/maintain-user" },
  { label: "User Access Right Assignment", route: "/user-access-rights" },
  { label: "Maintain Location", route: "/maintain-location", separator: true },
  { label: "Maintain Department", route: "/maintain-department" },
  { label: "Maintain Customer", route: "/maintain-customer" },
  { label: "Maintain Spare Part", route: "/maintain-spare-part", separator: true },
  { label: "Maintain Service Provider", route: "/maintain-service-provider" },
  { label: "Asset History", route: "/asset-history", separator: true },
];
