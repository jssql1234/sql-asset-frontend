import { Calculator, CalculatorFilled, LayoutDashboard, LayoutDashboardFilled, Clock, ClockFilled, Gauge, GaugeFilled, Bin, BinFilled, Location as LocationIcon, LocationFilled, ShieldCheck, ShieldCheckFilled, Calendar, CalendarFilled, Briefcase, BriefcaseFilled } from "@/assets/icons";
import type { ComponentType } from "react";

export const SIDEBAR_COOKIE_NAME = "sidebar:state" as const;  // Cookie name for persisting sidebar state
export const SIDEBAR_COOKIE_MAX_AGE = 604800;
export const SIDEBAR_WIDTH = "15rem" as const;
export const SIDEBAR_COLLAPSED_WIDTH = "3rem" as const;
export const SIDEBAR_KEYBOARD_SHORTCUT = "s" as const;

interface NavigationSection { title: string; items: NavigationItem[] }
interface NavigationItem { name: string; url: string; icon: ComponentType<{ className?: string }>; filledIcon: ComponentType<{ className?: string }> }
interface UserProfile { name: string; email: string; }

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

export const mockUser: UserProfile = { name: "Adam", email: "Adam@sql.com.my" };

export const toolsMenuRoutes = {
  assetGroup: "/maintain-asset-group", userGroup: "/maintain-user-group", user: "/maintain-user", userAccessRights: "/user-access-rights", location: "/maintain-location",
  department: "/maintain-department", customer: "/maintain-customer", sparePart: "/maintain-spare-part", serviceProvider: "/maintain-service-provider", assetHistory: "/asset-history",
} as const;
