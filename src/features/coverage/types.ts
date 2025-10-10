export type InsuranceStatus = "Active" | "Expiring Soon" | "Expired";
export type WarrantyStatus = "Active" | "Expiring Soon" | "Expired";
export type ClaimStatus = "Filed" | "Rejected" | "Settled" | "Approved";
export type ClaimType = "Insurance" | "Warranty";
export type CoverageStatus = InsuranceStatus | WarrantyStatus | ClaimStatus;

export interface CoverageInsurance {
  id: string;
  name: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  remainingCoverage: number;
  annualPremium: number;
  totalClaimed: number;
  startDate: string; // ISO date string
  expiryDate: string; // ISO date string
  status: InsuranceStatus;
  assetsCovered: {
    id: string;
    name: string;
  }[];
  description?: string;
}

export interface CoverageWarranty {
  id: string;
  name: string;
  provider: string;
  warrantyNumber: string;
  coverage: string;
  expiryDate: string;
  status: WarrantyStatus;
  assetsCovered: {
    id: string;
    name: string;
  }[];
  description?: string;
}

export interface CoverageClaim {
  id: string;
  claimNumber: string;
  type: ClaimType;
  referenceId: string;
  referenceName: string;
  assets: {
    id: string;
    name: string;
  }[];
  amount: number;
  status: ClaimStatus;
  dateFiled: string; // ISO date string
  workOrderId?: string;
  description?: string;
}

export interface InsuranceSummaryMetrics {
  activeInsurances: number;
  totalCoverage: number;
  remainingCoverage: number;
  annualPremiums: number;
  assetsCovered: number;
  assetsNotCovered: number;
  expiringSoon: number;
  expired: number;
}

export interface WarrantySummaryMetrics {
  activeWarranties: number;
  assetsCovered: number;
  assetsNotCovered: number;
  expiringSoon: number;
  expired: number;
}

export interface ClaimSummaryMetrics {
  totalClaims: number;
  pendingClaims: number;
  settledClaims: number;
  totalSettlementAmount: number;
  rejectedClaims: number;
}

export interface CoverageModalsState {
  insuranceForm: boolean;
  insuranceDetails: CoverageInsurance | null;
  warrantyForm: boolean;
  warrantyDetails: CoverageWarranty | null;
  claimForm: boolean;
  workOrderFromClaim: boolean;
  claimForWorkOrder: CoverageClaim | null;
  claimDetails: CoverageClaim | null;
}
