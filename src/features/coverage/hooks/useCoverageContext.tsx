import { createContext, use, useMemo, type ReactNode } from "react";
import type { CoverageInsurance, CoverageWarranty, CoverageClaim, CoverageModalsState } from "@/features/coverage/types";
import { useGetInsurances, useGetWarranties, useGetClaims } from "./useCoverageService";

export interface CoverageContextValue {
  insurances: CoverageInsurance[];
  warranties: CoverageWarranty[];
  claims: CoverageClaim[];
  modals: CoverageModalsState;
  setModals: React.Dispatch<React.SetStateAction<CoverageModalsState>>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const CoverageContext = createContext<CoverageContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useCoverageContext() {
  const context = use(CoverageContext);
  if (!context) {
    throw new Error("useCoverageContext must be used within CoverageProvider");
  }
  return context;
}

interface CoverageProviderProps {
  children: ReactNode;
  modals: CoverageModalsState;
  setModals: React.Dispatch<React.SetStateAction<CoverageModalsState>>;
}

export function CoverageProvider({ children, modals, setModals }: CoverageProviderProps) {
  const { data: insurances = [] } = useGetInsurances();
  const { data: warranties = [] } = useGetWarranties();
  const { data: claims = [] } = useGetClaims();

  const value = useMemo(() => ({
    insurances,
    warranties,
    claims,
    modals,
    setModals,
  }), [insurances, warranties, claims, modals, setModals]);

  return <CoverageContext value={value}>{children}</CoverageContext>;
}

