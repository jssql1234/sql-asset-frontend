import { useMemo } from "react";
import { InsurancesTab } from "@/features/coverage/components/tab/InsurancesTab";
import { WarrantiesTab } from "@/features/coverage/components/tab/WarrantiesTab";
import { ClaimsTab } from "@/features/coverage/components/tab/ClaimsTab";
import { coverageClaims, coverageInsurances, coverageWarranties, claimSummary, insuranceProviders, insuranceSummary, warrantyProviders, warrantySummary } from "@/features/coverage/mockData";
import type { ClaimFilters, CoverageClaim, CoverageModalsState, CoverageWarranty, InsuranceFilters, WarrantyFilters } from "@/features/coverage/types";

interface CoverageTabsProps {
  insuranceFilters: InsuranceFilters;
  setInsuranceFilters: React.Dispatch<React.SetStateAction<InsuranceFilters>>;
  warrantyFilters: WarrantyFilters;
  setWarrantyFilters: React.Dispatch<React.SetStateAction<WarrantyFilters>>;
  claimFilters: ClaimFilters;
  setClaimFilters: React.Dispatch<React.SetStateAction<ClaimFilters>>;
  setModals: React.Dispatch<React.SetStateAction<CoverageModalsState>>;
  handleViewInsurance: (insurance: CoverageModalsState["insuranceDetails"]) => void;
  handleViewWarranty: (warranty: CoverageWarranty) => void;
  handleViewClaim: (claim: CoverageClaim) => void;
}

export const useCoverageTabs = ({
  insuranceFilters,
  setInsuranceFilters,
  warrantyFilters,
  setWarrantyFilters,
  claimFilters,
  setClaimFilters,
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
            providers={insuranceProviders}
            filters={insuranceFilters}
            onFiltersChange={(filters) =>
              setInsuranceFilters((prev) => ({ ...prev, ...filters }))
            }
            onAddPolicy={() =>
              setModals((prev) => ({ ...prev, policyForm: true }))
            }
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
            providers={warrantyProviders}
            filters={warrantyFilters}
            onFiltersChange={(filters) =>
              setWarrantyFilters((prev) => ({ ...prev, ...filters }))
            }
            onAddWarranty={() =>
              setModals((prev) => ({ ...prev, warrantyForm: true }))
            }
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
            filters={claimFilters}
            onFiltersChange={(filters) =>
              setClaimFilters((prev) => ({ ...prev, ...filters }))
            }
            onAddClaim={() =>
              setModals((prev) => ({ ...prev, claimForm: true }))
            }
            onViewClaim={handleViewClaim}
          />
        ),
      },
    ],
    [
      claimFilters,
      handleViewClaim,
      handleViewInsurance,
      handleViewWarranty,
      insuranceFilters,
      setClaimFilters,
      setModals,
      setInsuranceFilters,
      setWarrantyFilters,
      warrantyFilters,
    ]
  );
};