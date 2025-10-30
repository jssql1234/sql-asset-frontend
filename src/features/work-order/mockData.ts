import type {
  WorkOrder,
  MaintenanceSummary,
  WorkOrderSummary,
  Warranty,
} from "./types";

// Mock Warranties
export const MOCK_WARRANTIES: Warranty[] = [
  {
    id: "WAR-2024-001",
    assetIds: ["AST-001", "AST-009"], // Excavators
    startDate: "2024-01-15",
    endDate: "2026-01-15",
  },
  {
    id: "WAR-2024-002",
    assetIds: ["AST-003", "AST-008", "AST-015"], // Cranes
    startDate: "2024-03-20",
    endDate: "2026-03-20",
  },
  {
    id: "WAR-2024-003",
    assetIds: ["AST-004", "AST-011", "AST-018"], // Generators
    startDate: "2024-06-01",
    endDate: "2027-06-01",
  },
  {
    id: "WAR-2024-004",
    assetIds: ["AST-004"], // Generator Cummins 500kVA
    startDate: "2024-02-10",
    endDate: "2026-02-10",
  },
  {
    id: "WAR-2024-005",
    assetIds: ["AST-006", "AST-013", "AST-020"], // Compressors
    startDate: "2024-04-15",
    endDate: "2025-04-15"
  },
];

// Mock Work Orders
export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: "WO-001",
    assetId: "AST-001",
    assetName: "Excavator CAT 320D",
    assetCode: "EXC-001",
    jobTitle: "Track Alignment & Tension Adjustment",
    description: "Adjust track tension and alignment due to uneven wear",
    type: "Corrective",
    status: "In Progress",
    serviceBy: "In-House",
    assignedTo: "John Smith",
    requestedDate: "2025-09-20",
    scheduledDate: "2025-09-30",
    scheduledStartDateTime: "2025-09-30T08:00",
    scheduledEndDateTime: "2025-09-30T16:00",
    actualStartDateTime: "2025-09-30T08:15",
    startDate: "2025-09-30",
    estimatedCost: 3500.0,
    actualCost: 3200.0,
    progress: 65,
    warrantyStatus: "Claimable",
    notes: "Track tension was significantly off. Replaced damaged links and adjusted alignment.",
    partsUsed: [
      {
        id: "P-001",
        partName: "Track Link",
        quantity: 4,
        unitCost: 250.0,
        totalCost: 1000.0,
      },
    ],
    logs: [
      {
        id: "LOG-001",
        timestamp: "2025-09-30 09:00",
        technician: "John Smith",
        notes: "Started inspection - found 3 damaged links",
      },
    ],
  },
  {
    id: "WO-002",
    assetId: "AST-006",
    assetName: "Compressor Atlas Copco XAS 185",
    assetCode: "CMP-006",
    jobTitle: "Air Filter Replacement",
    description: "Routine air filter replacement as per maintenance schedule",
    type: "Preventive",
    status: "Completed",
    serviceBy: "In-House",
    assignedTo: "Mike Johnson",
    requestedDate: "2025-09-15",
    scheduledDate: "2025-09-25",
    startDate: "2025-09-25",
    completedDate: "2025-09-25",
    estimatedCost: 800.0,
    actualCost: 750.0,
    progress: 100,
    warrantyStatus: "No Warranty",
    partsUsed: [
      {
        id: "P-002",
        partName: "Air Filter Element",
        quantity: 2,
        unitCost: 150.0,
        totalCost: 300.0,
      },
    ],
  },
  {
    id: "WO-003",
    assetId: "AST-003",
    assetName: "Crane Liebherr LTM 1060",
    assetCode: "CRN-003",
    jobTitle: "Hydraulic Hose Replacement - Emergency",
    description: "Emergency replacement of burst hydraulic hose",
    type: "Emergency",
    status: "Completed",
    serviceBy: "Outsourced",
    assignedTo: "ABC Crane Services",
    requestedDate: "2025-09-18",
    scheduledDate: "2025-09-18",
    startDate: "2025-09-18",
    completedDate: "2025-09-19",
    estimatedCost: 8000.0,
    actualCost: 8500.0,
    progress: 100,
    warrantyStatus: "Claimable",
  },
  {
    id: "WO-004",
    assetId: "AST-007",
    assetName: "Welding Machine Lincoln Electric",
    assetCode: "WLD-007",
    jobTitle: "Calibration Service",
    description: "Annual calibration and certification",
    type: "Upgrade/Modify",
    status: "Pending",
    serviceBy: "Outsourced",
    assignedTo: "Precision Calibration Inc",
    requestedDate: "2025-09-22",
    scheduledDate: "2025-10-08",
    estimatedCost: 1200.0,
    progress: 0,
    warrantyStatus: "No Warranty",
  },
  {
    id: "WO-005",
    assetId: "AST-004",
    assetName: "Generator Cummins 500kVA",
    assetCode: "GEN-004",
    jobTitle: "Control Panel Repair",
    description: "Repair faulty control panel under warranty",
    type: "Corrective",
    status: "Pending",
    serviceBy: "Outsourced",
    assignedTo: "Cummins Service Center",
    requestedDate: "2025-09-28",
    scheduledDate: "2025-10-05",
    estimatedCost: 0.0,
    progress: 0,
    warrantyId: "WAR-2024-004",
    warrantyStatus: "Claimed",
  },
];

// Mock Maintenance Summary
export const MOCK_MAINTENANCE_SUMMARY: MaintenanceSummary = {
  totalScheduled: 24,
  inProgress: 3,
  completed: 15,
  overdue: 2,
  totalCost: 45800.0,
  utilizationRate: 78.5,
};

// Mock Work Order Summary
export const MOCK_WORK_ORDER_SUMMARY: WorkOrderSummary = {
  totalWorkOrders: 48,
  inProgress: 12,
  completed: 28,
  overdue: 4,
  totalCost: 156400.0,
};

// Mock Assets for dropdowns
export const MOCK_ASSETS = [
  { id: "AST-001", name: "Excavator CAT 320D", code: "EXC-001" },
  { id: "AST-002", name: "Bulldozer Komatsu D65", code: "BLD-002" },
  { id: "AST-003", name: "Crane Liebherr LTM 1060", code: "CRN-003" },
  { id: "AST-004", name: "Generator Cummins 500kVA", code: "GEN-004" },
  { id: "AST-005", name: "Forklift Toyota 8FG25", code: "FRK-005" },
  { id: "AST-006", name: "Compressor Atlas Copco XAS 185", code: "CMP-006" },
  { id: "AST-007", name: "Welding Machine Lincoln Electric", code: "WLD-007" },
  { id: "AST-008", name: "Tower Crane Potain MD 365", code: "CRN-008" },
  { id: "AST-009", name: "Bulldozer CAT D6T", code: "BLD-009" },
  { id: "AST-010", name: "Excavator Hitachi ZX350", code: "EXC-010" },
  { id: "AST-011", name: "Generator Perkins 250kVA", code: "GEN-011" },
  { id: "AST-012", name: "Forklift Hyster H50FT", code: "FRK-012" },
  { id: "AST-013", name: "Compressor Ingersoll Rand", code: "CMP-013" },
  { id: "AST-014", name: "Welding Machine ESAB Rebel", code: "WLD-014" },
  { id: "AST-015", name: "Tower Crane Liebherr 200 EC", code: "CRN-015" },
  { id: "AST-016", name: "Excavator Volvo EC220E", code: "EXC-016" },
  { id: "AST-017", name: "Bulldozer John Deere 750K", code: "BLD-017" },
  { id: "AST-018", name: "Generator Caterpillar C15", code: "GEN-018" },
  { id: "AST-019", name: "Forklift Yale GDP050VX", code: "FRK-019" },
  { id: "AST-020", name: "Compressor Sullair 185", code: "CMP-020" },
  { id: "AST-021", name: "Welding Machine Miller Millermatic", code: "WLD-021" },
];

// Mock Technicians
export const MOCK_TECHNICIANS = [
  { id: "T-001", name: "John Smith" },
  { id: "T-002", name: "Mike Johnson" },
  { id: "T-003", name: "Sarah Williams" },
  { id: "T-004", name: "David Brown" },
  { id: "T-005", name: "Emily Davis" },
];

// Mock Vendors
export const MOCK_VENDORS = [
  { id: "V-001", name: "ABC Crane Services" },
  { id: "V-002", name: "Power Solutions Ltd" },
  { id: "V-003", name: "Precision Calibration Inc" },
  { id: "V-004", name: "Cummins Service Center" },
  { id: "V-005", name: "Heavy Equipment Specialists" },
];

// Maintenance Types
export const MAINTENANCE_TYPES = [
  "Preventive",
  "Corrective",
  "Upgrade/Modify",
  "Emergency",
];

// Status Options
export const STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Completed",
  "Overdue",
];
