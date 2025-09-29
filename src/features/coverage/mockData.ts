import type {
  CoverageClaim,
  CoveragePolicy,
  CoverageWarranty,
  ClaimSummaryMetrics,
  PolicySummaryMetrics,
  WarrantySummaryMetrics,
} from "./types";

export const coveragePolicies: CoveragePolicy[] = [
  {
    id: "POL-001",
    name: "Comprehensive Equipment Protection",
    provider: "Allied Insurance Berhad",
    policyNumber: "AIB-CEQ-2025-01",
    coverageAmount: 1_200_000,
    remainingCoverage: 875_000,
    annualPremium: 68_400,
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

export const policySummary: PolicySummaryMetrics = {
  activePolicies: coveragePolicies.filter(policy => policy.status === "Active").length,
  totalCoverage: coveragePolicies.reduce((acc, policy) => acc + policy.coverageAmount, 0),
  remainingCoverage: coveragePolicies.reduce((acc, policy) => acc + policy.remainingCoverage, 0),
  annualPremiums: coveragePolicies.reduce((acc, policy) => acc + policy.annualPremium, 0),
  assetsCovered: coveragePolicies.reduce((acc, policy) => acc + policy.assetsCovered.length, 0),
  assetsNotCovered: 12,
  expiringSoon: coveragePolicies.filter(policy => policy.status === "Expiring Soon").length,
  expired: coveragePolicies.filter(policy => policy.status === "Expired").length,
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

export const policyProviders = Array.from(new Set(coveragePolicies.map(policy => policy.provider)));
export const warrantyProviders = Array.from(new Set(coverageWarranties.map(warranty => warranty.provider)));
