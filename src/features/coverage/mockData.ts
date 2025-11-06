// Asset-related mock data for coverage module
// Only asset data is kept here for use in asset selection dropdowns

export interface CoverageAssetGroup { 
  id: string; 
  label: string; 
  assets: { id: string; name: string }[] 
}

export interface CoverageAsset { 
  id: string; 
  name: string; 
  groupId: string; 
  groupLabel: string 
}

export const coverageAssetGroups: CoverageAssetGroup[] = [
  {
    id: "assembly-line",
    label: "Assembly Line",
    assets: [ 
      { id: "CBT-001", name: "Conveyor Belt A1" }, 
      { id: "PMP-002", name: "Pump System B2" } 
    ],
  },
  {
    id: "power-systems",
    label: "Power Systems",
    assets: [ 
      { id: "GEN-003", name: "Generator C3" }, 
      { id: "AC-004", name: "Air Compressor D4" } 
    ],
  },
  {
    id: "support-equipment",
    label: "Support Equipment",
    assets: [ 
      { id: "HP-005", name: "Hydraulic Press E5" }, 
      { id: "CS-006", name: "Cooling System F6" } 
    ],
  },
  {
    id: "quality-control",
    label: "Quality Control",
    assets: [ 
      { id: "QC-007", name: "Quality Scanner G7" }, 
      { id: "TM-008", name: "Testing Machine H8" } 
    ],
  },
  {
    id: "maintenance-tools",
    label: "Maintenance Tools",
    assets: [
      { id: "WR-009", name: "Welding Robot I9" }, 
      { id: "DM-010", name: "Diagnostic Machine J10" },
      { id: "WR-011", name: "Welding Robot K11" }, 
      { id: "DM-012", name: "Diagnostic Machine L12" },
      { id: "CR-013", name: "Calibration Robot M13" }, 
      { id: "TM-014", name: "Tooling Machine N14" },
      { id: "SM-015", name: "Soldering Machine O15" }, 
      { id: "PM-016", name: "Precision Machine P16" },
    ],
  },
];

export const coverageAssets: CoverageAsset[] = coverageAssetGroups.flatMap((group) =>
  group.assets.map((asset) => ({
    id: asset.id,
    name: asset.name,
    groupId: group.id,
    groupLabel: group.label,
  }))
);

export const coverageAssetMap: Partial<Record<string, CoverageAsset>> = coverageAssets.reduce<
  Partial<Record<string, CoverageAsset>>
>((acc, asset) => {
  acc[asset.id] = asset;
  return acc;
}, {});

export const getCoverageAssetInfo = (assetId: string): CoverageAsset | undefined =>
  coverageAssetMap[assetId];

export const getCoverageAssetName = (assetId: string): string =>
  coverageAssetMap[assetId]?.name ?? "Unknown Asset";

// Coverage-related mock data for demonstration when no records found
import type { CoverageInsurance, CoverageWarranty, CoverageClaim } from "./types";

export const mockInsurances: CoverageInsurance[] = [
  {
    id: "POL-001",
    name: "Comprehensive Equipment Protection",
    provider: "Global Insurance Corp",
    policyNumber: "GIC-CEQ-2025-001",
    coverageAmount: 500000,
    remainingCoverage: 450000,
    annualPremium: 25000,
    limitType: "Aggregate",
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    assetsCovered: [
      { id: "CBT-001", name: "Conveyor Belt A1" },
      { id: "PMP-002", name: "Pump System B2" },
      { id: "GEN-003", name: "Generator C3" }
    ],
    description: "Comprehensive coverage for critical manufacturing equipment",
    status: "Active",
    totalClaimed: 50000
  },
  {
    id: "POL-002",
    name: "Maintenance Tools Insurance",
    provider: "Industrial Risk Solutions",
    policyNumber: "IRS-MTL-2025-002",
    coverageAmount: 150000,
    remainingCoverage: 150000,
    annualPremium: 7500,
    limitType: "Per Occurrence",
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months from now
    assetsCovered: [
      { id: "WR-009", name: "Welding Robot I9" },
      { id: "DM-010", name: "Diagnostic Machine J10" },
      { id: "WR-011", name: "Welding Robot K11" }
    ],
    description: "Specialized coverage for maintenance and diagnostic equipment",
    status: "Active",
    totalClaimed: 0
  }
];

export const mockWarranties: CoverageWarranty[] = [
  {
    id: "WAR-001",
    name: "Generator Extended Warranty",
    provider: "PowerTech Solutions",
    warrantyNumber: "PTS-GEN-2025-001",
    coverage: "Parts and Labor",
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(), // 2 years from now
    assetsCovered: [
      { id: "GEN-003", name: "Generator C3" }
    ],
    description: "Extended warranty covering parts and labor for generator maintenance",
    status: "Active"
  },
  {
    id: "WAR-002",
    name: "Quality Control Systems Warranty",
    provider: "Precision Instruments Ltd",
    warrantyNumber: "PIL-QCS-2025-002",
    coverage: "Parts Only",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    expiryDate: new Date(Date.now() + 395 * 24 * 60 * 60 * 1000).toISOString(), // ~1 year from start date
    assetsCovered: [
      { id: "QC-007", name: "Quality Scanner G7" },
      { id: "TM-008", name: "Testing Machine H8" }
    ],
    description: "Manufacturer warranty for quality control and testing equipment",
    status: "Upcoming"
  }
];

export const mockClaims: CoverageClaim[] = [
  {
    id: "CLM-001",
    claimNumber: "CLM-2025-001",
    type: "Insurance",
    referenceId: "POL-001",
    referenceName: "Comprehensive Equipment Protection",
    assets: [
      { id: "CBT-001", name: "Conveyor Belt A1" }
    ],
    amount: 15000,
    status: "Filed",
    dateFiled: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    description: "Conveyor belt motor failure requiring replacement",
    workOrderId: undefined
  },
  {
    id: "CLM-002",
    claimNumber: "CLM-2025-002",
    type: "Warranty",
    referenceId: "WAR-001",
    referenceName: "Generator Extended Warranty",
    assets: [
      { id: "GEN-003", name: "Generator C3" }
    ],
    amount: 0,
    status: "Settled",
    dateFiled: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    description: "Generator maintenance service under warranty",
    workOrderId: "WO-2025-001"
  }
];
