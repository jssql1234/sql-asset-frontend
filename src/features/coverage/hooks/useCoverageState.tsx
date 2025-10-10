import { useCallback, useState } from "react";
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

  return {
    modals,
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