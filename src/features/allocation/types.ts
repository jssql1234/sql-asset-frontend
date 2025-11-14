import type { ReactNode } from "react";

export type AssetStatus =
  | "Available"
  | "In Use"
  | "Fully Booked"
  | "Maintenance"
  | "Reserved";

export type AvailabilityStatus =
  | "Available"
  | "Scheduled"
  | "In Maintenance"
  | "Reserved"
  | "Unavailable";

export interface AssetRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  pic: string;
  status: AssetStatus;
  total: number;
  allocated: number;
  remaining: number;
  utilizationRate: number;
  updatedAt: string;
  nextMaintenance?: string;
  notes?: string;
  tags?: string[];
}

export interface AllocationSummary {
  totalAssets: number;
  allocatedAssets: number;
  availableAssets: number;
  utilizationRate: number;
}

export type AllocationType = "location" | "user";

export interface AllocationSelection {
  assetId: string;
  assetName: string;
  availableQuantity: number;
  requestedQuantity: number;
}

export interface AllocationActionPayload {
  type: AllocationType;
  targetLocation?: string;
  targetUser?: string;
  startDate?: string;
  endDate?: string;
  assets: AllocationSelection[];
  notes?: string;
}

export type CalendarEventType =
  | "scheduled-rental"
  | "active-rental"
  | "in-use"
  | "maintenance"
  | "return-due";

export interface CalendarEventRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: CalendarEventType;
  start: string;
  end?: string;
  location?: string;
  assignee?: string;
  status?: AssetStatus;
  notes?: string;
}

export type RentalStatus =
  | "Scheduled"
  | "Active"
  | "Completed"
  | "Overdue"
  | "Cancelled";

export interface RentalRecord {
  id: string;
  assetId: string;
  assetName: string;
  customerName: string;
  location: string;
  status: RentalStatus;
  startDate: string;
  endDate?: string;
  quantity: number;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

export interface RentalPayload {
  assetIds: string[];
  customerName: string;
  rentAmount: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface AllocationDetailsSection {
  title: string;
  content: ReactNode;
}
