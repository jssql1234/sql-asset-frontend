import { createContext, use } from "react";
import type { CoverageInsurance, CoverageWarranty, CoverageClaim, CoverageModalsState } from "@/features/coverage/types";

export interface CoverageContextValue {
  insurances: CoverageInsurance[];
  warranties: CoverageWarranty[];
  claims: CoverageClaim[];
  modals: CoverageModalsState;
  setModals: React.Dispatch<React.SetStateAction<CoverageModalsState>>;
}

export const CoverageContext = createContext<CoverageContextValue | null>(null);

export function useCoverageContext() {
  const context = use(CoverageContext);
  if (!context) {
    throw new Error("useCoverageContext must be used within CoverageProvider");
  }
  return context;
}
