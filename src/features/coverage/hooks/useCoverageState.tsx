import { useCallback, useState, useMemo } from "react";
import { InsurancesTab } from "@/features/coverage/components/tab/InsurancesTab";
import { WarrantiesTab } from "@/features/coverage/components/tab/WarrantiesTab";
import { ClaimsTab } from "@/features/coverage/components/tab/ClaimsTab";
import { coverageClaims, coverageInsurances, coverageWarranties, claimSummary, insuranceSummary, warrantySummary } from "@/features/coverage/mockData";
import type { CoverageClaim, CoverageModalsState, CoverageWarranty } from "@/features/coverage/types";

export const useCoverageState = () => {
  const [modals, setModals] = useState<CoverageModalsState>({
    insuranceForm: false,
    insuranceEdit: null,
    insuranceDetails: null,
    warrantyForm: false,
    warrantyEdit: null,
    warrantyDetails: null,
    claimForm: false,
    claimEdit: null,
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

  const handleEditInsurance = useCallback(
    (insurance: CoverageModalsState["insuranceEdit"]) => {
      setModals((prev) => ({
        ...prev,
        insuranceForm: true,
        insuranceEdit: insurance,
      }));
    },
    []
  );

  const handleDeleteInsurance = useCallback(
    (insurance: CoverageModalsState["insuranceEdit"]) => {
      // TODO: Implement actual delete API call
      console.log("Delete insurance:", insurance?.id);
      // For now, just log the action
      // In production, this would call an API endpoint
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

  const handleEditWarranty = useCallback(
    (warranty: CoverageWarranty) => {
      setModals((prev) => ({
        ...prev,
        warrantyForm: true,
        warrantyEdit: warranty,
      }));
    },
    []
  );

  const handleDeleteWarranty = useCallback(
    (warranty: CoverageWarranty) => {
      // TODO: Implement actual delete API call
      console.log("Delete warranty:", warranty.id);
      // For now, just log the action
      // In production, this would call an API endpoint
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

  const handleEditClaim = useCallback(
    (claim: CoverageClaim) => {
      setModals((prev) => ({
        ...prev,
        claimForm: true,
        claimEdit: claim,
      }));
    },
    []
  );

  const handleDeleteClaim = useCallback(
    (claim: CoverageClaim) => {
      // TODO: Implement actual delete API call
      console.log("Delete claim:", claim.id);
      // For now, just log the action
      // In production, this would call an API endpoint
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
            onEditInsurance={handleEditInsurance}
            onDeleteInsurance={handleDeleteInsurance}
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
            onEditWarranty={handleEditWarranty}
            onDeleteWarranty={handleDeleteWarranty}
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
            onEditClaim={handleEditClaim}
            onDeleteClaim={handleDeleteClaim}
          />
        ),
      },
    ],
    [
      handleViewClaim,
      handleViewInsurance,
      handleViewWarranty,
      handleEditInsurance,
      handleEditWarranty,
      handleEditClaim,
      handleDeleteInsurance,
      handleDeleteWarranty,
      handleDeleteClaim,
    ]
  );

  return {
    modals,
    tabs,
    setModals,
    handleViewInsurance,
    handleEditInsurance,
    handleDeleteInsurance,
    handleCloseInsuranceDetails,
    handleCloseWarrantyDetails,
    handleCloseWorkOrder,
    handleViewWarranty,
    handleEditWarranty,
    handleDeleteWarranty,
    handleViewClaim,
    handleEditClaim,
    handleDeleteClaim,
    handleCloseClaimDetails,    
  };
};