import { useMemo, type ReactNode } from "react";
import type { CoverageModalsState } from "@/features/coverage/types";
import { CoverageContext } from "@/features/coverage/context/CoverageContext";
import { useGetInsurances, useGetWarranties, useGetClaims } from "./useCoverageService";

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

