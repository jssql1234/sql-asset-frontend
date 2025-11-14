export type AssetStatus =
  | "Available"
  | "In Use"
  | "Fully Booked"
  | "Maintenance"
  | "Reserved";

export interface AssetRecord {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  user: string;
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
  rentAmount?: number;
  rentPerUnit?: number;
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

export interface AllocationCategoryOption {
  id: string;
  label: string;
}

export interface AllocationItemOption {
  id: string;
  label: string;
  sublabel: string;
}

export interface UseAllocationAssetsResult {
  assetCategories: AllocationCategoryOption[];
  assetItems: AllocationItemOption[];
  selectedAssetIds: string[];
  selectedCategoryId: string;
  setSelectedCategoryId: (categoryId: string) => void;
  handleAssetSelectionChange: (assetIds: string[]) => void;
  resetAssetSelection: () => void;
}

export type AllocationCalendarEventType =
  | "user-assignment"
  | "location-allocation"
  | "overdue"
  | "maintenance";

export interface AllocationCalendarEvent {
  id: string;
  title: string;
  type: AllocationCalendarEventType;
  start: string;
  end?: string;
  assetName: string;
  assignee?: string;
  location?: string;
}
