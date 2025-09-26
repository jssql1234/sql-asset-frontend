import type { ComponentType } from "react";
import type { IconProps } from "@tabler/icons-react";
import { Store, Calculator, FileStack, LayoutDashboard, CalendarEvent, Tool, OrderDetails, Clock, ShieldCheck, Gauge, Users, Roles, UserCog, Company, Location, Building, Map, CompanyList, History, Settings } from "@/assets/icons";

export type SidebarIconComponent = ComponentType<IconProps>;

export interface SidebarItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: SidebarIconComponent;
  readonly href?: string;
  readonly onClick?: () => void;
}

export interface SidebarSection {
  readonly title: string;
  readonly items: readonly SidebarItem[];
}

export const SIDEBAR_SECTIONS = [
  {
    title: "",
    items: [
      { id: "asset", label: "Asset List", icon: Store, href: "/asset" },
    ],
  },
  {
    title: "Tax Computation",
    items: [
      { id: "process-ca", label: "Process CA", icon: Calculator, href: "/process-ca" },
      { id: "disposal", label: "Asset Disposal", icon: FileStack, href: "/disposal" },
    ],
  },
  {
    title: "Asset Maintenance",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { id: "maintenance-schedule", label: "Maintenance Schedule", icon: CalendarEvent, href: "/maintenance-schedule" },
      { id: "work-request", label: "Work Requests", icon: Tool, href: "/work-request" },
      { id: "allocation", label: "Allocation", icon: OrderDetails, href: "/allocation" },
      { id: "downtime-tracking", label: "Downtime Records", icon: Clock, href: "/downtime-tracking" },
      { id: "insurance", label: "Insurance & Warranty Claims", icon: ShieldCheck, href: "/insurance" },
      { id: "meter-reading", label: "Meter Reading", icon: Gauge, href: "/meter-reading" },
    ],
  },
  {
    title: "Tools",
    items: [
      { id: "user-group-management", label: "User Group Management", icon: Users, href: "/user-group-management" },
      { id: "user-access-rights", label: "User Access Rights", icon: Roles, href: "/user-access-rights" },
      { id: "maintenance-pic", label: "Maintain User...", icon: UserCog, href: "/maintenance-PIC" },
      { id: "maintenance-spare-parts", label: "Maintain Spare Part...", icon: Tool, href: "/maintenance-spare-parts" },
      { id: "maintenance-in-house-labors", label: "Maintain In-House Labor...", icon: Building, href: "/maintenance-in-house-labors" },
      { id: "maintenance-outsourced-vendors", label: "Maintain Outsourced Vendor...", icon: Company, href: "/maintenance-outsourced-vendors" },
      { id: "maintenance-locations", label: "Maintain Location...", icon: Location, href: "/maintenance-locations" },
      { id: "maintenance-departments", label: "Maintain Department...", icon: Building, href: "/maintenance-departments" },
      { id: "maintenance-location-types", label: "Maintain Location Type...", icon: Map, href: "/maintenance-location-types" },
      { id: "maintenance-vendors", label: "Maintain Vendor...", icon: Store, href: "/maintenance-vendors" },
      { id: "maintenance-assetGroup", label: "Maintain Asset Group...", icon: CompanyList, href: "/maintenance-assetGroup" },
      { id: "asset-history", label: "Asset History", icon: History, href: "/asset-history" },
      { id: "options", label: "Options", icon: Settings, onClick: () => console.log("Opening options sub-window") },
    ],
  },
] as const satisfies readonly SidebarSection[];

export type SidebarItemId =
  (typeof SIDEBAR_SECTIONS)[number]["items"][number]["id"];

export const getPageTitle = (itemId: string): string => {
  for (const section of SIDEBAR_SECTIONS) {
    const matchedItem = section.items.find((item) => item.id === itemId);
    if (matchedItem) {
      return matchedItem.label;
    }
  }

  return "SQL Asset";
};