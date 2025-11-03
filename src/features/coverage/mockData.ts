import type {
  CoverageClaim,
  CoverageInsurance,
  CoverageWarranty,
  ClaimSummaryMetrics,
  InsuranceSummaryMetrics,
  WarrantySummaryMetrics,
} from "./types";

export const coverageInsurances: CoverageInsurance[] = [
  {
    id: "POL-001",
    name: "Comprehensive Equipment Protection",
    provider: "Allied Insurance Berhad",
    policyNumber: "AIB-CEQ-2025-01",
    coverageAmount: 1_200_000,
    remainingCoverage: 875_000,
    annualPremium: 68_400,
    limitType: "Aggregate",
    totalClaimed: 325_000,
    startDate: "2024-01-01",
    expiryDate: "2025-12-31",
    status: "Active",
    assetsCovered: [
      { id: "AST-001", name: "CNC Milling Machine" },
      { id: "AST-014", name: "Laser Cutting Line" },
      { id: "AST-027", name: "Automated Storage System" },
    ],
    description:
      "Enterprise-wide umbrella policy covering manufacturing critical machinery including production lines and automation equipment.",
  },
  {
    id: "POL-002",
    name: "Logistics Fleet Coverage",
    provider: "Guardian Mutual",
    policyNumber: "GM-FLT-4432",
    coverageAmount: 850_000,
    remainingCoverage: 265_000,
    annualPremium: 42_600,
    limitType: "Per Occurrence",
    totalClaimed: 585_000,
    startDate: "2024-04-19",
    expiryDate: "2025-04-18",
    status: "Expiring Soon",
    assetsCovered: [
      { id: "AST-066", name: "Prime Mover #3" },
      { id: "AST-068", name: "24ft Refrigerated Trailer" },
    ],
    description:
      "Specialised coverage for transport vehicles including temperature-controlled distribution trailers.",
  },
  {
    id: "POL-003",
    name: "HVAC Preventive Policy",
    provider: "Northern Shield",
    policyNumber: "NS-HVAC-8821",
    coverageAmount: 430_000,
    remainingCoverage: 0,
    annualPremium: 21_300,
    limitType: "Aggregate",
    totalClaimed: 430_000,
    startDate: "2023-11-16",
    expiryDate: "2024-11-15",
    status: "Expired",
    assetsCovered: [
      { id: "AST-032", name: "Cooling Tower #2" },
      { id: "AST-033", name: "Heat Exchanger #4" },
      { id: "AST-035", name: "Make-up Air Handler" },
    ],
    description:
      "Facility-wide HVAC system coverage including spare parts, labour and on-site commissioning.",
  },
];

export const insuranceSummary: InsuranceSummaryMetrics = {
  activeInsurances: coverageInsurances.filter(insurance => insurance.status === "Active").length,
  totalCoverage: coverageInsurances.reduce((acc, insurance) => acc + insurance.coverageAmount, 0),
  remainingCoverage: coverageInsurances.reduce((acc, insurance) => acc + insurance.remainingCoverage, 0),
  annualPremiums: coverageInsurances.reduce((acc, insurance) => acc + insurance.annualPremium, 0),
  assetsCovered: coverageInsurances.reduce((acc, insurance) => acc + insurance.assetsCovered.length, 0),
  assetsNotCovered: 12,
  expiringSoon: coverageInsurances.filter(insurance => insurance.status === "Expiring Soon").length,
  expired: coverageInsurances.filter(insurance => insurance.status === "Expired").length,
};

export const coverageWarranties: CoverageWarranty[] = [
  {
    id: "WAR-001",
    name: "SPC Packaging Robotics Warranty",
    provider: "OmniCare Manufacturing",
    warrantyNumber: "OMNI-PR-2201",
    coverage: "Parts and Labour",
    expiryDate: "2026-02-01",
    status: "Active",
    assetsCovered: [
      { id: "AST-041", name: "Pick & Place Robotic Arm" },
      { id: "AST-042", name: "Smart Vision Inspection" },
    ],
    description:
      "Extended warranty bundle for the new generation packaging robotics cell including calibration services.",
  },
  {
    id: "WAR-002",
    name: "Warehouse Automation Warranty",
    provider: "Innovate Service Centre",
    warrantyNumber: "ISC-WA-009",
    coverage: "Full Coverage",
    expiryDate: "2025-10-12",
    status: "Expiring Soon",
    assetsCovered: [
      { id: "AST-051", name: "Autonomous Forklift" },
    ],
    description:
      "Comprehensive coverage for automated guided vehicles with preventive maintenance visits.",
  },
  {
    id: "WAR-003",
    name: "Facility Access Control Warranty",
    provider: "SecureOne Technologies",
    warrantyNumber: "S1-AC-7781",
    coverage: "Parts",
    expiryDate: "2024-06-30",
    status: "Expired",
    assetsCovered: [
      { id: "AST-075", name: "Biometric Turnstile" },
      { id: "AST-076", name: "RFID Gate" },
    ],
    description:
      "Parts-only coverage for security access infrastructure across production blocks.",
  },
];

export const warrantySummary: WarrantySummaryMetrics = {
  activeWarranties: coverageWarranties.filter(warranty => warranty.status === "Active").length,
  assetsCovered: coverageWarranties.reduce((acc, warranty) => acc + warranty.assetsCovered.length, 0),
  assetsNotCovered: 7,
  expiringSoon: coverageWarranties.filter(warranty => warranty.status === "Expiring Soon").length,
  expired: coverageWarranties.filter(warranty => warranty.status === "Expired").length,
};

export const coverageClaims: CoverageClaim[] = [
  {
    id: "CLM-001",
    claimNumber: "CLM-2025-118",
    type: "Insurance",
    referenceId: "POL-001",
    referenceName: "Comprehensive Equipment Protection",
    assets: [
      { id: "AST-014", name: "Laser Cutting Line" },
    ],
    amount: 145_800,
    status: "Filed",
    dateFiled: "2025-09-01",
    workOrderId: undefined,
    description:
      "Damage to precision optics after unexpected power surge during production run.",
  },
  {
    id: "CLM-002",
    claimNumber: "CLM-2025-103",
    type: "Warranty",
    referenceId: "WAR-001",
    referenceName: "SPC Packaging Robotics Warranty",
    assets: [
      { id: "AST-041", name: "Pick & Place Robotic Arm" },
      { id: "AST-042", name: "Smart Vision Inspection" },
    ],
    amount: 58_300,
    status: "Settled",
    dateFiled: "2025-05-22",
    workOrderId: "WO-4521",
    description:
      "Servo calibration failure causing repeated production stoppages.",
  },
  {
    id: "CLM-003",
    claimNumber: "CLM-2024-287",
    type: "Insurance",
    referenceId: "POL-002",
    referenceName: "Logistics Fleet Coverage",
    assets: [
      { id: "AST-066", name: "Prime Mover #3" },
    ],
    amount: 92_500,
    status: "Rejected",
    dateFiled: "2024-12-18",
    workOrderId: undefined,
    description:
      "Collision repair claim rejected pending external investigation outcome.",
  },
];

export const claimSummary: ClaimSummaryMetrics = {
  totalClaims: coverageClaims.length,
  pendingClaims: coverageClaims.filter(claim => claim.status === "Filed").length,
  settledClaims: coverageClaims.filter(claim => claim.status === "Settled" || claim.status === "Approved").length,
  totalSettlementAmount: coverageClaims
    .filter(claim => claim.status === "Settled" || claim.status === "Approved")
    .reduce((acc, claim) => acc + claim.amount, 0),
  rejectedClaims: coverageClaims.filter(claim => claim.status === "Rejected").length,
};



export interface CoverageAssetGroup { id: string; label: string; assets: { id: string; name: string }[] }
export interface CoverageAsset { id: string; name: string; groupId: string; groupLabel: string }

export const coverageAssetGroups: CoverageAssetGroup[] = [
  {
    id: "assembly-line",
    label: "Assembly Line",
    assets: [ { id: "CBT-001", name: "Conveyor Belt A1" }, { id: "PMP-002", name: "Pump System B2" } ],
  },
  {
    id: "power-systems",
    label: "Power Systems",
    assets: [ { id: "GEN-003", name: "Generator C3" }, { id: "AC-004", name: "Air Compressor D4" } ],
  },
  {
    id: "support-equipment",
    label: "Support Equipment",
    assets: [ { id: "HP-005", name: "Hydraulic Press E5" }, { id: "CS-006", name: "Cooling System F6" } ],
  },
  {
    id: "quality-control",
    label: "Quality Control",
    assets: [ { id: "QC-007", name: "Quality Scanner G7" }, { id: "TM-008", name: "Testing Machine H8" } ],
  },
  {
    id: "maintenance-tools",
    label: "Maintenance Tools",
    assets: [
      { id: "WR-009", name: "Welding Robot I9" }, { id: "DM-010", name: "Diagnostic Machine J10" },
      { id: "WR-011", name: "Welding Robot K11" }, { id: "DM-012", name: "Diagnostic Machine L12" },
      { id: "CR-013", name: "Calibration Robot M13" }, { id: "TM-014", name: "Tooling Machine N14" },
      { id: "SM-015", name: "Soldering Machine O15" }, { id: "PM-016", name: "Precision Machine P16" },
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
