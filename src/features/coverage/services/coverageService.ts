import type { CoverageInsurance, CoverageWarranty, CoverageClaim, InsuranceSummaryMetrics, WarrantySummaryMetrics, ClaimSummaryMetrics } from "../types";
import { coverageAssets, mockInsurances, mockWarranties, mockClaims } from "../mockData";

// In-memory data stores (persists during session, not across page refreshes)
let insurancesStore: CoverageInsurance[] = [...mockInsurances];
let warrantiesStore: CoverageWarranty[] = [...mockWarranties];
let claimsStore: CoverageClaim[] = [...mockClaims];
let nextInsuranceId = 3; // Start from 3 since we have POL-001 and POL-002
let nextWarrantyId = 3; // Start from 3 since we have WAR-001 and WAR-002
let nextClaimId = 3; // Start from 3 since we have CLM-001 and CLM-002

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
const calculateWarrantyStatus = (expiryDate: string): CoverageWarranty["status"] => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  if (today > expiry) return "Expired";
  
  const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry <= 30) return "Expiring Soon";
  
  return "Active";
};

// Calculate insurance summary
const calculateInsuranceSummary = (): InsuranceSummaryMetrics => {
  const activeInsurances = insurancesStore.filter(ins => ins.status === "Active").length;
  const totalCoverage = insurancesStore.reduce((acc, ins) => acc + ins.coverageAmount, 0);
  const remainingCoverage = insurancesStore.reduce((acc, ins) => acc + ins.remainingCoverage, 0);
  const annualPremiums = insurancesStore.reduce((acc, ins) => acc + ins.annualPremium, 0);
  
  const coveredAssetIds = new Set(insurancesStore.flatMap(ins => ins.assetsCovered.map(a => a.id)));
  const assetsCovered = coveredAssetIds.size;
  const assetsNotCovered = Math.max(0, coverageAssets.length - assetsCovered);
  
  return {
    activeInsurances,
    totalCoverage,
    remainingCoverage,
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
  
  return {
    activeWarranties,
    assetsCovered,
    assetsNotCovered,
    expiringSoon: warrantiesStore.filter(war => war.status === "Expiring Soon").length,
    expired: warrantiesStore.filter(war => war.status === "Expired").length,
  };
};

// Calculate claim summary
const calculateClaimSummary = (): ClaimSummaryMetrics => {
  const totalClaims = claimsStore.length;
  const pendingClaims = claimsStore.filter(claim => claim.status === "Filed").length;
  const settledClaims = claimsStore.filter(claim => claim.status === "Settled" || claim.status === "Approved").length;
  const totalSettlementAmount = claimsStore
    .filter(claim => claim.status === "Settled" || claim.status === "Approved")
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

export const createInsurance = (data: Omit<CoverageInsurance, 'id' | 'status' | 'totalClaimed'>): Promise<CoverageInsurance> => {
  const id = `POL-${String(nextInsuranceId++).padStart(3, '0')}`;
  const status = calculateInsuranceStatus(data.startDate, data.expiryDate);
  const totalClaimed = data.coverageAmount - data.remainingCoverage;
  
  const newInsurance: CoverageInsurance = {
    ...data,
    id,
    status,
    totalClaimed,
  };
  
  insurancesStore.unshift(newInsurance);
  return Promise.resolve(newInsurance);
};

export const updateInsurance = (id: string, data: Omit<CoverageInsurance, 'id' | 'status' | 'totalClaimed'>): Promise<CoverageInsurance> => {
  const index = insurancesStore.findIndex(ins => ins.id === id);
  if (index === -1) throw new Error("Insurance policy not found");
  
  const status = calculateInsuranceStatus(data.startDate, data.expiryDate);
  const totalClaimed = data.coverageAmount - data.remainingCoverage;
  
  const updated: CoverageInsurance = {
    ...data,
    id,
    status,
    totalClaimed,
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

export const createWarranty = (data: Omit<CoverageWarranty, 'id' | 'status'>): Promise<CoverageWarranty> => {
  const id = `WAR-${String(nextWarrantyId++).padStart(3, '0')}`;
  const status = calculateWarrantyStatus(data.expiryDate);
  
  const newWarranty: CoverageWarranty = {
    ...data,
    id,
    status,
  };
  
  warrantiesStore.unshift(newWarranty);
  return Promise.resolve(newWarranty);
};

export const updateWarranty = (id: string, data: Omit<CoverageWarranty, 'id' | 'status'>): Promise<CoverageWarranty> => {
  const index = warrantiesStore.findIndex(war => war.id === id);
  if (index === -1) throw new Error("Warranty not found");
  
  const status = calculateWarrantyStatus(data.expiryDate);
  
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

export const createClaim = (data: Omit<CoverageClaim, 'id'>): Promise<CoverageClaim> => {
  const id = `CLM-${String(nextClaimId++).padStart(3, '0')}`;
  const amount = Number.isFinite(data.amount) ? data.amount : 0;
  
  const newClaim: CoverageClaim = {
    ...data,
    id,
    amount,
  };
  
  claimsStore.unshift(newClaim);
  
  // Update insurance remaining coverage
  if (newClaim.type === "Insurance") {
    const insuranceIndex = insurancesStore.findIndex(ins => ins.id === newClaim.referenceId);
    if (insuranceIndex !== -1) {
      const insurance = insurancesStore[insuranceIndex];
      const newRemainingCoverage = Math.max(0, insurance.remainingCoverage - amount);
      insurancesStore[insuranceIndex] = {
        ...insurance,
        remainingCoverage: newRemainingCoverage,
        totalClaimed: insurance.coverageAmount - newRemainingCoverage,
      };
    }
  }
  
  return Promise.resolve(newClaim);
};

export const updateClaim = (id: string, data: Omit<CoverageClaim, 'id'>): Promise<CoverageClaim> => {
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
  
  // Adjust insurance coverage if amount changed
  if (updated.type === "Insurance") {
    const amountDifference = safeAmount - oldAmount;
    if (amountDifference !== 0) {
      const insuranceIndex = insurancesStore.findIndex(ins => ins.id === updated.referenceId);
    
      if (insuranceIndex !== -1) {
        const insurance = insurancesStore[insuranceIndex];
        const newRemainingCoverage = Math.min(
          insurance.coverageAmount,
          Math.max(0, insurance.remainingCoverage - amountDifference)
        );
        insurancesStore[insuranceIndex] = {
          ...insurance,
          remainingCoverage: newRemainingCoverage,
          totalClaimed: insurance.coverageAmount - newRemainingCoverage,
        };
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
  
  // Restore insurance coverage
  if (claim.type === "Insurance") {
    const insuranceIndex = insurancesStore.findIndex(ins => ins.id === claim.referenceId);
    if (insuranceIndex !== -1) {
      const insurance = insurancesStore[insuranceIndex];
      const newRemainingCoverage = Math.min(
        insurance.coverageAmount,
        insurance.remainingCoverage + amount
      );
      insurancesStore[insuranceIndex] = {
        ...insurance,
        remainingCoverage: newRemainingCoverage,
        totalClaimed: insurance.coverageAmount - newRemainingCoverage,
      };
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
