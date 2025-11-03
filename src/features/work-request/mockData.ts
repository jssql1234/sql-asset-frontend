import type { WorkRequest } from "./types";

// Mock work request data
export const mockWorkRequests: WorkRequest[] = [
  {
    id: "1",
    requestId: "WR-001",
    requesterName: "John Doe",
    department: "Production",
    selectedAssets: [
      {
        main: {
          code: "AST-001",
          name: "Hydraulic Press Machine",
          description: "Main production line hydraulic press",
          location: "Building A - Floor 1",
        },
      },
    ],
    requestType: "Maintenance",
    problemDescription: "Hydraulic press showing reduced pressure and unusual noise during operation.",
    additionalNotes: "This issue started yesterday morning. Priority should be given as it affects the main production line.",
    status: "Pending",
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    requestId: "WR-002",
    requesterName: "Jane Smith",
    department: "Quality Assurance",
    selectedAssets: [
      {
        main: {
          code: "AST-002",
          name: "Quality Scanner G7",
          description: "Automated quality inspection scanner",
          location: "Building B - QA Lab",
        },
      },
    ],
    requestType: "Repair",
    problemDescription: "Scanner is not detecting defects properly, calibration error suspected.",
    status: "Approved",
    requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    workOrderNumber: "WO-2024-001",
    workOrderCreatedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    requestId: "WR-003",
    requesterName: "Mike Johnson",
    department: "Maintenance",
    selectedAssets: [
      {
        main: {
          code: "AST-003",
          name: "Conveyor Belt A1",
          description: "Main assembly line conveyor",
          location: "Building A - Assembly Line",
        },
      },
      {
        main: {
          code: "AST-004",
          name: "Conveyor Belt A2",
          description: "Secondary assembly line conveyor",
          location: "Building A - Assembly Line",
        },
      },
    ],
    requestType: "Inspection",
    problemDescription: "Regular monthly inspection due for conveyor belt systems.",
    status: "Approved",
    requestDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    approvedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    requestId: "WR-004",
    requesterName: "Sarah Lee",
    department: "Operations",
    selectedAssets: [
      {
        main: {
          code: "AST-005",
          name: "Cooling System F6",
          description: "Main cooling system for production floor",
          location: "Building A - HVAC Room",
        },
      },
    ],
    requestType: "Emergency",
    problemDescription: "Cooling system completely stopped working. Temperature rising rapidly in production area.",
    additionalNotes: "URGENT: This is affecting all production operations. Immediate attention required.",
    status: "Rejected",
    requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    rejectionReason: "Issue was resolved internally by facilities team. No external maintenance required.",
    managementNotes: "Resolved by in-house team. Filter replacement was sufficient.",
  },
];

// Helper to get asset info from localStorage or mock data
export const getAssetInfo = (assetCode: string) => {
  try {
    const savedAssetData = localStorage.getItem('assetData');
    if (savedAssetData) {
      const parsed = JSON.parse(savedAssetData);
      const assets = parsed.assets || [];
      const asset = assets.find((a: any) => a.code === assetCode);
      if (asset) {
        return {
          code: asset.code,
          name: asset.name,
          description: asset.description,
          location: asset.location,
        };
      }
    }
  } catch (error) {
    console.error('Error loading asset data:', error);
  }
  
  // Fallback to mock data
  const mockAsset = mockWorkRequests
    .flatMap(wr => wr.selectedAssets)
    .find(asset => asset.main.code === assetCode);
  
  return mockAsset?.main;
};

// Asset categories for SearchWithDropdown
export const assetCategories = [
  { id: "all", label: "All Categories" },
  { id: "heavy", label: "Heavy Equipment", sublabel: "qty: 2" },
  {
    id: "power",
    label: "Power Equipment",
    sublabel: "Generators, Compressors",
  },
  { id: "material", label: "Material Handling", sublabel: "Forklifts" },
  { id: "tools", label: "Tools & Machinery", sublabel: "Welding Machines" },
];
