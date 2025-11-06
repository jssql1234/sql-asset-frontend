export type InsuranceStatus = "Active" | "Expiring Soon" | "Expired" | "Upcoming";
export type WarrantyStatus = "Active" | "Expiring Soon" | "Expired" | "Upcoming";
export type ClaimStatus = "Filed" | "Rejected" | "Settled" | "Approved";
export type ClaimType = "Insurance" | "Warranty";
export type CoverageStatus = InsuranceStatus | WarrantyStatus | ClaimStatus;
export type InsuranceLimitType = "Aggregate" | "Per Occurrence";

export interface CoverageEntityAsset {
  id: string;
  name: string;
}

export interface CoverageInsurance {
  id: string;
  name: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  remainingCoverage: number;
  annualPremium: number;
  limitType: InsuranceLimitType;
  totalClaimed: number;
  startDate: string; // ISO date string
  expiryDate: string; // ISO date string
  status: InsuranceStatus;
  assetsCovered: CoverageEntityAsset[];
  description?: string;
}

export interface CoverageWarranty {
  id: string;
  name: string;
  provider: string;
  warrantyNumber: string;
  coverage: string;
  startDate: string; // ISO date string
  expiryDate: string;
  status: WarrantyStatus;
  assetsCovered: CoverageEntityAsset[];
  description?: string;
}

export interface CoverageClaim {
  id: string;
  claimNumber: string;
  type: ClaimType;
  referenceId: string;
  referenceName: string;
  assets: CoverageEntityAsset[];
  amount: number;
  status: ClaimStatus;
  dateFiled: string; // ISO date string
  workOrderId?: string;
  description?: string;
}

export interface InsuranceSummaryMetrics {
  activeInsurances: number;
  totalInsuranceClaimed: number;
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
  successfulWarrantyClaims: number;
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
  insuranceEdit: CoverageInsurance | null;
  insuranceDetails: CoverageInsurance | null;
  warrantyForm: boolean;
  warrantyEdit: CoverageWarranty | null;
  warrantyDetails: CoverageWarranty | null;
  claimForm: boolean;
  claimEdit: CoverageClaim | null;
  workOrderFromClaim: boolean;
  claimForWorkOrder: CoverageClaim | null;
  claimDetails: CoverageClaim | null;
}

export type CoverageInsurancePayload = Omit<CoverageInsurance, "id" | "status" | "totalClaimed">;
export type CoverageWarrantyPayload = Omit<CoverageWarranty, "id" | "status">;
export type CoverageClaimPayload = Omit<CoverageClaim, "id">;

export const EMPTY_INSURANCE_SUMMARY: InsuranceSummaryMetrics = {
  activeInsurances: 0,
  totalInsuranceClaimed: 0,
  remainingCoverage: 0,
  annualPremiums: 0,
  assetsCovered: 0,
  assetsNotCovered: 0,
  expiringSoon: 0,
  expired: 0,
};

export const EMPTY_WARRANTY_SUMMARY: WarrantySummaryMetrics = {
  activeWarranties: 0,
  assetsCovered: 0,
  assetsNotCovered: 0,
  expiringSoon: 0,
  expired: 0,
  successfulWarrantyClaims: 0,
};

export const EMPTY_CLAIM_SUMMARY: ClaimSummaryMetrics = {
  totalClaims: 0,
  pendingClaims: 0,
  settledClaims: 0,
  totalSettlementAmount: 0,
  rejectedClaims: 0,
};
