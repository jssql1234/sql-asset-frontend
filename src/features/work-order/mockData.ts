import type {
  WorkOrder,
  WorkOrderSummary,
} from "./types";

// Mock Work Orders
export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: "WO-001",
    assetId: "GEN-003",
    assetName: "Generator C3",
    assetCode: "GEN-003",
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
    assetId: "AC-004",
    assetName: "Air Compressor D4",
    assetCode: "AC-004",
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
    assetId: "HP-005",
    assetName: "Hydraulic Press E5",
    assetCode: "HP-005",
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
  },
  {
    id: "WO-004",
    assetId: "QC-007",
    assetName: "Quality Scanner G7",
    assetCode: "QC-007",
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
  },
  {
    id: "WO-005",
    assetId: "TM-008",
    assetName: "Testing Machine H8",
    assetCode: "TM-008",
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
  },
];

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
  { id: "CBT-001", name: "Conveyor Belt A1", code: "CBT-001" },
  { id: "PMP-002", name: "Pump System B2", code: "PMP-002" },
  { id: "GEN-003", name: "Generator C3", code: "GEN-003" },
  { id: "AC-004", name: "Air Compressor D4", code: "AC-004" },
  { id: "HP-005", name: "Hydraulic Press E5", code: "HP-005" },
  { id: "CS-006", name: "Cooling System F6", code: "CS-006" },
  { id: "QC-007", name: "Quality Scanner G7", code: "QC-007" },
  { id: "TM-008", name: "Testing Machine H8", code: "TM-008" },
  { id: "WR-009", name: "Welding Robot I9", code: "WR-009" },
  { id: "DM-010", name: "Diagnostic Machine J10", code: "DM-010" },
  { id: "WR-011", name: "Welding Robot K11", code: "WR-011" },
  { id: "DM-012", name: "Diagnostic Machine L12", code: "DM-012" },
  { id: "CR-013", name: "Calibration Robot M13", code: "CR-013" },
  { id: "TM-014", name: "Tooling Machine N14", code: "TM-014" },
  { id: "SM-015", name: "Soldering Machine O15", code: "SM-015" },
  { id: "PM-016", name: "Precision Machine P16", code: "PM-016" },
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

// Maintenance Types (for backward compatibility with existing components)
export const MAINTENANCE_TYPES = [
  "Preventive",
  "Corrective",
  "Upgrade/Modify",
  "Emergency",
] as const;

// Status Options (for backward compatibility with existing components)
export const STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Completed",
  "Overdue",
] as const;
