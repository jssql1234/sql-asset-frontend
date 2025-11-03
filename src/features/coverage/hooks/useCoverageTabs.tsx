import { useMemo } from "react";
import { InsurancesTab } from "@/features/coverage/components/tab/InsurancesTab";
import { WarrantiesTab } from "@/features/coverage/components/tab/WarrantiesTab";
import { ClaimsTab } from "@/features/coverage/components/tab/ClaimsTab";
import { coverageClaims, coverageInsurances, coverageWarranties, claimSummary, insuranceSummary, warrantySummary } from "@/features/coverage/mockData";
import type { CoverageClaim, CoverageModalsState, CoverageWarranty } from "@/features/coverage/types";

interface CoverageTabsProps {
  setModals: React.Dispatch<React.SetStateAction<CoverageModalsState>>;
  handleViewInsurance: (insurance: CoverageModalsState["insuranceDetails"]) => void;
  handleViewWarranty: (warranty: CoverageWarranty) => void;
  handleViewClaim: (claim: CoverageClaim) => void;
}

export const useCoverageTabs = ({
  setModals,
  handleViewInsurance,
  handleViewWarranty,
  handleViewClaim,
}: CoverageTabsProps) => {
  return useMemo(
    () => [
      {
        label: "Insurance Policies",
        value: "insurances",
        content: (
          <InsurancesTab
            insurances={coverageInsurances}
            summary={insuranceSummary}
            onAddPolicy={() => {
              setModals((prev) => ({ ...prev, insuranceForm: true }));
            }}
            onViewInsurance={handleViewInsurance}
          />
        ),
      },
      {
        label: "Warranties",
        value: "warranties",
        content: (
          <WarrantiesTab
            warranties={coverageWarranties}
            summary={warrantySummary}
            onAddWarranty={() => {
              setModals((prev) => ({ ...prev, warrantyForm: true }));
            }}
            onViewWarranty={handleViewWarranty}
          />
        ),
      },
      {
        label: "Claim Management",
        value: "claims",
        content: (
          <ClaimsTab
            claims={coverageClaims}
            summary={claimSummary}
            onAddClaim={() => {
              setModals((prev) => ({ ...prev, claimForm: true }));
            }}
            onViewClaim={handleViewClaim}
          />
        ),
      },
    ],
    [
      handleViewClaim,
      handleViewInsurance,
      handleViewWarranty,
      setModals,
    ]
  );
};