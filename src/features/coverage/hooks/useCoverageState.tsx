import { useCallback, useState, useMemo } from "react";
import { InsurancesTab } from "@/features/coverage/components/tab/InsurancesTab";
import { WarrantiesTab } from "@/features/coverage/components/tab/WarrantiesTab";
import { ClaimsTab } from "@/features/coverage/components/tab/ClaimsTab";
import { coverageClaims, coverageInsurances, coverageWarranties, claimSummary, insuranceSummary, warrantySummary } from "@/features/coverage/mockData";
import type { CoverageClaim, CoverageModalsState, CoverageWarranty } from "@/features/coverage/types";

export const useCoverageState = () => {
  const [modals, setModals] = useState<CoverageModalsState>({
    insuranceForm: false,
    insuranceDetails: null,
    warrantyForm: false,
    warrantyDetails: null,
    claimForm: false,
    workOrderFromClaim: false,
    claimForWorkOrder: null,
    claimDetails: null,
  });

  const handleViewInsurance = useCallback(
    (insurance: CoverageModalsState["insuranceDetails"]) => {
      setModals((prev) => ({
        ...prev,
        insuranceDetails: insurance,
      }));
    },
    []
  );

  const handleCloseInsuranceDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      insuranceDetails: null,
    }));
  }, []);

  const handleCloseWarrantyDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      warrantyDetails: null,
    }));
  }, []);

  const handleCloseWorkOrder = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      workOrderFromClaim: false,
      claimForWorkOrder: null,
    }));
  }, []);

  const handleViewWarranty = useCallback(
    (warranty: CoverageWarranty) => {
      setModals((prev) => ({
        ...prev,
        warrantyDetails: warranty,
      }));
    },
    []
  );

  const handleViewClaim = useCallback(
    (claim: CoverageClaim) => {
      setModals((prev) => ({
        ...prev,
        claimDetails: claim,
      }));
    },
    []
  );

  const handleCloseClaimDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      claimDetails: null,
    }));
  }, []);

  const tabs = useMemo(
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
    ]
  );

  return {
    modals,
    tabs,
    setModals,
    handleViewInsurance,
    handleCloseInsuranceDetails,
    handleCloseWarrantyDetails,
    handleCloseWorkOrder,
    handleViewWarranty,
    handleViewClaim,
    handleCloseClaimDetails,    
  };
};