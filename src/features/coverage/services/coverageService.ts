import type { CoverageInsurance, CoverageInsurancePayload, CoverageWarranty, CoverageWarrantyPayload, 
              CoverageClaim, CoverageClaimPayload, InsuranceSummaryMetrics, WarrantySummaryMetrics, ClaimSummaryMetrics } from "../types";
import { coverageAssets, mockInsurances, mockWarranties, mockClaims } from "../mockData";

// Helper to calculate expiry date by adding 364 days to the start date
// This represents a typical 1-year coverage period (365 days - 1 day for inclusive calculation)
export const calculateExpiryDate = (startDate: Date): Date => {
  const expiryDate = new Date(startDate);
  expiryDate.setDate(startDate.getDate() + 364);
  return expiryDate;
};

export interface FormatCurrencyOptions {
  locale?: string;
  currencyPrefix?: string;
}

const DEFAULT_CURRENCY_OPTIONS: Required<FormatCurrencyOptions> = {
  locale: "en-MY",
  currencyPrefix: "RM",
};

export const formatCurrency = (value: number, options: FormatCurrencyOptions = {}): string => {
  const { locale, currencyPrefix } = { ...DEFAULT_CURRENCY_OPTIONS, ...options };
  const formattingOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  };

  return `${currencyPrefix} ${value.toLocaleString(locale, formattingOptions)}`;
};

export interface FormatDateOptions {
  locale?: string;
  dateStyle?: "full" | "long" | "medium" | "short";
}

const DEFAULT_DATE_OPTIONS: Required<FormatDateOptions> = {
  locale: "en-GB",
  dateStyle: "medium",
};

export const formatDate = (isoDate: string, options: FormatDateOptions = {}): string => {
  const { locale, dateStyle } = { ...DEFAULT_DATE_OPTIONS, ...options };
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle }).format(date);
};

// In-memory data stores (persists during session, not across page refreshes)
let insurancesStore: CoverageInsurance[] = [...mockInsurances];
let warrantiesStore: CoverageWarranty[] = [...mockWarranties];
let claimsStore: CoverageClaim[] = [...mockClaims];
let nextInsuranceId = 3; // Start from 3 due to mockData
let nextWarrantyId = 3; 
let nextClaimId = 3; 

// Helper to calculate insurance status
const calculateInsuranceStatus = (startDate: string, expiryDate: string): CoverageInsurance["status"] => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const start = new Date(startDate);

  if (Number.isNaN(expiry.getTime()) || Number.isNaN(start.getTime())) {
    return "Active";
  }

  if (today < start) return "Upcoming";
  if (today > expiry) return "Expired";

  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 30) return "Expiring Soon";

  return "Active";
};

// Helper to calculate warranty status
const calculateWarrantyStatus = (startDate: string, expiryDate: string): CoverageWarranty["status"] => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const start = new Date(startDate);
  
  if (Number.isNaN(expiry.getTime()) || Number.isNaN(start.getTime())) {
    return "Active";
  }

  if (today < start) return "Upcoming"; // Warranties that haven't started yet
  if (today > expiry) return "Expired";
  
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 30) return "Expiring Soon";
  
  return "Active";
};

// Calculate insurance summary
const calculateInsuranceSummary = (): InsuranceSummaryMetrics => {
  const activeInsurances = insurancesStore.filter(ins => ins.status === "Active").length;
  const totalInsuranceClaimed = claimsStore
    .filter(claim => claim.type === "Insurance" && claim.status === "Settled")
    .reduce((acc, claim) => acc + claim.amount, 0);
  
  // Calculate remaining coverage: only deduct settled claims from aggregate policies
  let totalRemainingCoverage = 0;
  for (const insurance of insurancesStore) {
    if (insurance.limitType === "Aggregate") {
      // For aggregate, calculate based on settled claims
      const settledClaimsForPolicy = claimsStore
        .filter(claim => 
          claim.type === "Insurance" && 
          claim.referenceId === insurance.id && 
          claim.status === "Settled"
        )
        .reduce((acc, claim) => acc + claim.amount, 0);
      totalRemainingCoverage += Math.max(0, insurance.coverageAmount - settledClaimsForPolicy);
    } else {
      // For per occurrence, remaining coverage equals coverage amount
      totalRemainingCoverage += insurance.coverageAmount;
    }
  }
  
  const annualPremiums = insurancesStore.reduce((acc, ins) => acc + ins.annualPremium, 0);
  
  const coveredAssetIds = new Set(insurancesStore.flatMap(ins => ins.assetsCovered.map(a => a.id)));
  const assetsCovered = coveredAssetIds.size;
  const assetsNotCovered = Math.max(0, coverageAssets.length - assetsCovered);
  
  return {
    activeInsurances,
    totalInsuranceClaimed,
    remainingCoverage: totalRemainingCoverage,
    annualPremiums,
    assetsCovered,
    assetsNotCovered,
    expiringSoon: insurancesStore.filter(ins => ins.status === "Expiring Soon").length,
    expired: insurancesStore.filter(ins => ins.status === "Expired").length,
  };
};

// Calculate warranty summary
const calculateWarrantySummary = (): WarrantySummaryMetrics => {
  const activeWarranties = warrantiesStore.filter(war => war.status === "Active").length;
  
  const coveredAssetIds = new Set(warrantiesStore.flatMap(war => war.assetsCovered.map(a => a.id)));
  const assetsCovered = coveredAssetIds.size;
  const assetsNotCovered = Math.max(0, coverageAssets.length - assetsCovered);
  
  const successfulWarrantyClaims = claimsStore.filter(claim => 
    claim.type === "Warranty" && claim.status === "Settled"
  ).length;
  
  return {
    activeWarranties,
    assetsCovered,
    assetsNotCovered,
    expiringSoon: warrantiesStore.filter(war => war.status === "Expiring Soon").length,
    expired: warrantiesStore.filter(war => war.status === "Expired").length,
    successfulWarrantyClaims,
  };
};

// Calculate claim summary
const calculateClaimSummary = (): ClaimSummaryMetrics => {
  const totalClaims = claimsStore.length;
  const pendingClaims = claimsStore.filter(claim => claim.status === "Filed").length;
  const settledClaims = claimsStore.filter(claim => claim.status === "Settled").length;
  const totalSettlementAmount = claimsStore
    .filter(claim => claim.status === "Settled")
    .reduce((acc, claim) => acc + claim.amount, 0);
  const rejectedClaims = claimsStore.filter(claim => claim.status === "Rejected").length;
  
  return {
    totalClaims,
    pendingClaims,
    settledClaims,
    totalSettlementAmount,
    rejectedClaims,
  };
};

// Insurance CRUD
export const fetchInsurances = (): Promise<CoverageInsurance[]> => {
  return Promise.resolve([...insurancesStore]);
};

export const createInsurance = (data: CoverageInsurancePayload): Promise<CoverageInsurance> => {
  const id = `POL-${String(nextInsuranceId++).padStart(3, '0')}`;
  const status = calculateInsuranceStatus(data.startDate, data.expiryDate);
  // totalClaimed will be 0 for new insurance
  const totalClaimed = 0;
  
  const newInsurance: CoverageInsurance = {
    ...data,
    id,
    status,
    totalClaimed,
  };
  
  insurancesStore.unshift(newInsurance);
  return Promise.resolve(newInsurance);
};

export const updateInsurance = (id: string, data: CoverageInsurancePayload): Promise<CoverageInsurance> => {
  const index = insurancesStore.findIndex(ins => ins.id === id);
  if (index === -1) throw new Error("Insurance policy not found");
  
  const status = calculateInsuranceStatus(data.startDate, data.expiryDate);
  
  // Calculate totalClaimed based on settled claims only
  const settledClaimsForPolicy = claimsStore
    .filter(claim => 
      claim.type === "Insurance" && 
      claim.referenceId === id && 
      claim.status === "Settled"
    )
    .reduce((acc, claim) => acc + claim.amount, 0);
  
  const updated: CoverageInsurance = {
    ...data,
    id,
    status,
    totalClaimed: settledClaimsForPolicy,
  };
  
  insurancesStore[index] = updated;
  return Promise.resolve(updated);
};

export const deleteInsurance = (id: string): Promise<void> => {
  insurancesStore = insurancesStore.filter(ins => ins.id !== id);
  return Promise.resolve();
};

// Warranty CRUD
export const fetchWarranties = (): Promise<CoverageWarranty[]> => {
  return Promise.resolve([...warrantiesStore]);
};

export const createWarranty = (data: CoverageWarrantyPayload): Promise<CoverageWarranty> => {
  const id = `WAR-${String(nextWarrantyId++).padStart(3, '0')}`;
  const status = calculateWarrantyStatus(data.startDate, data.expiryDate);
  
  const newWarranty: CoverageWarranty = {
    ...data,
    id,
    status,
  };
  
  warrantiesStore.unshift(newWarranty);
  return Promise.resolve(newWarranty);
};

export const updateWarranty = (id: string, data: CoverageWarrantyPayload): Promise<CoverageWarranty> => {
  const index = warrantiesStore.findIndex(war => war.id === id);
  if (index === -1) throw new Error("Warranty not found");
  
  const status = calculateWarrantyStatus(data.startDate, data.expiryDate);
  
  const updated: CoverageWarranty = {
    ...data,
    id,
    status,
  };
  
  warrantiesStore[index] = updated;
  return Promise.resolve(updated);
};

export const deleteWarranty = (id: string): Promise<void> => {
  warrantiesStore = warrantiesStore.filter(war => war.id !== id);
  return Promise.resolve();
};

// Claim CRUD
export const fetchClaims = (): Promise<CoverageClaim[]> => {
  return Promise.resolve([...claimsStore]);
};

export const createClaim = (data: CoverageClaimPayload, skipNotification?: boolean): Promise<CoverageClaim> => {
  const id = `CLM-${String(nextClaimId++).padStart(3, '0')}`;
  const amount = Number.isFinite(data.amount) ? data.amount : 0;
  
  const newClaim: CoverageClaim = {
    ...data,
    id,
    amount,
  };
  
  claimsStore.unshift(newClaim);
  
  // Create notification for the claim (skip if this claim was created from a coverage notification)
  if (!skipNotification) {
    void import("@/features/notification/services/notificationService").then(({ notificationService }) => {
      const assetNames = newClaim.assets.map(asset => asset.name).join(", ");
      notificationService.createNotification({
        type: "claim",
        title: `${newClaim.type} Claim Filed`,
        message: `Claim ${newClaim.claimNumber} has been filed for ${assetNames}. Create a work order to address this claim.`,
        sourceModule: "coverage",
        sourceId: newClaim.id,
        actionUrl: "/work-orders",
        actionLabel: "Create Work Order",
        metadata: {
          claimId: newClaim.id,
          claimNumber: newClaim.claimNumber,
          claimType: newClaim.type,
          assets: newClaim.assets,
          description: newClaim.description,
          amount: newClaim.amount,
        },
      });
    });
  }
  
  // Update insurance remaining coverage and totalClaimed - only for Aggregate type and Settled status
  if (newClaim.type === "Insurance" && newClaim.status === "Settled") {
    const insuranceIndex = insurancesStore.findIndex(ins => ins.id === newClaim.referenceId);
    if (insuranceIndex !== -1) {
      const insurance = insurancesStore[insuranceIndex];
      // Only deduct if limit type is Aggregate
      if (insurance.limitType === "Aggregate") {
        const newRemainingCoverage = Math.max(0, insurance.remainingCoverage - amount);
        const settledClaimsTotal = claimsStore
          .filter(claim => 
            claim.type === "Insurance" && 
            claim.referenceId === insurance.id && 
            claim.status === "Settled"
          )
          .reduce((acc, claim) => acc + claim.amount, 0);
        insurancesStore[insuranceIndex] = {
          ...insurance,
          remainingCoverage: newRemainingCoverage,
          totalClaimed: settledClaimsTotal,
        };
      }
    }
  }
  
  return Promise.resolve(newClaim);
};

export const updateClaim = (id: string, data: CoverageClaimPayload): Promise<CoverageClaim> => {
  const index = claimsStore.findIndex(claim => claim.id === id);
  if (index === -1) throw new Error("Claim not found");
  
  const oldClaim = claimsStore[index];
  const oldAmount = Number.isFinite(oldClaim.amount) ? oldClaim.amount : 0;

  if (data.type !== oldClaim.type || data.referenceId !== oldClaim.referenceId) {
    throw new Error("Claim type, reference, or claim number cannot be changed once created.");
  }

  const safeAmount = Number.isFinite(data.amount) ? data.amount : 0;
  
  const updated: CoverageClaim = {
    ...data,
    id,
    amount: safeAmount,
  };
  
  claimsStore[index] = updated;
  
  // Adjust insurance coverage if status or amount changed - only for Aggregate type
  if (updated.type === "Insurance") {
    const insuranceIndex = insurancesStore.findIndex(ins => ins.id === updated.referenceId);
    
    if (insuranceIndex !== -1) {
      const insurance = insurancesStore[insuranceIndex];
      // Only adjust if limit type is Aggregate
      if (insurance.limitType === "Aggregate") {
        let amountDifference = 0;
        
        // Calculate the difference based on status changes
        const oldWasSettled = oldClaim.status === "Settled";
        const newIsSettled = updated.status === "Settled";
        
        if (!oldWasSettled && newIsSettled) {
          // Changed to Settled - deduct the full amount
          amountDifference = safeAmount;
        } else if (oldWasSettled && !newIsSettled) {
          // Changed from Settled - restore the full amount
          amountDifference = -oldAmount;
        } else if (oldWasSettled && newIsSettled) {
          // Both settled - adjust for amount change
          amountDifference = safeAmount - oldAmount;
        }
        // If neither old nor new is Settled, no adjustment needed
        
        if (amountDifference !== 0) {
          const newRemainingCoverage = Math.min(
            insurance.coverageAmount,
            Math.max(0, insurance.remainingCoverage - amountDifference)
          );
          const settledClaimsTotal = claimsStore
            .filter(claim => 
              claim.type === "Insurance" && 
              claim.referenceId === insurance.id && 
              claim.status === "Settled"
            )
            .reduce((acc, claim) => acc + claim.amount, 0);
          insurancesStore[insuranceIndex] = {
            ...insurance,
            remainingCoverage: newRemainingCoverage,
            totalClaimed: settledClaimsTotal,
          };
        } else {
          // Even if no amount difference, recalculate totalClaimed
          const settledClaimsTotal = claimsStore
            .filter(claim => 
              claim.type === "Insurance" && 
              claim.referenceId === insurance.id && 
              claim.status === "Settled"
            )
            .reduce((acc, claim) => acc + claim.amount, 0);
          insurancesStore[insuranceIndex] = {
            ...insurance,
            totalClaimed: settledClaimsTotal,
          };
        }
      }
    }
  }
  
  return Promise.resolve(updated);
};

export const deleteClaim = (id: string): Promise<void> => {
  const claimIndex = claimsStore.findIndex(claim => claim.id === id);
  if (claimIndex === -1) return Promise.resolve();
  
  const claim = claimsStore[claimIndex];
  const amount = Number.isFinite(claim.amount) ? claim.amount : 0;
  
  // Restore insurance coverage - only for Aggregate type and Settled claims
  if (claim.type === "Insurance" && claim.status === "Settled") {
    const insuranceIndex = insurancesStore.findIndex(ins => ins.id === claim.referenceId);
    if (insuranceIndex !== -1) {
      const insurance = insurancesStore[insuranceIndex];
      // Only restore if limit type is Aggregate
      if (insurance.limitType === "Aggregate") {
        const newRemainingCoverage = Math.min(
          insurance.coverageAmount,
          insurance.remainingCoverage + amount
        );
        // Recalculate totalClaimed after removing this claim
        const settledClaimsTotal = claimsStore
          .filter(c => 
            c.id !== id && // Exclude the claim being deleted
            c.type === "Insurance" && 
            c.referenceId === insurance.id && 
            c.status === "Settled"
          )
          .reduce((acc, c) => acc + c.amount, 0);
        insurancesStore[insuranceIndex] = {
          ...insurance,
          remainingCoverage: newRemainingCoverage,
          totalClaimed: settledClaimsTotal,
        };
      }
    }
  }
  
  claimsStore = claimsStore.filter(claim => claim.id !== id);
  return Promise.resolve();
};

// Summary fetchers
export const fetchInsuranceSummary = (): Promise<InsuranceSummaryMetrics> => {
  return Promise.resolve(calculateInsuranceSummary());
};

export const fetchWarrantySummary = (): Promise<WarrantySummaryMetrics> => {
  return Promise.resolve(calculateWarrantySummary());
};

export const fetchClaimSummary = (): Promise<ClaimSummaryMetrics> => {
  return Promise.resolve(calculateClaimSummary());
};
