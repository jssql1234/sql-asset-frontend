import { useCallback } from "react";
import type { CoverageClaim, CoverageInsurance, CoverageWarranty } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";

export function useCoverageModals() {
  const { modals, setModals } = useCoverageContext();

  const openInsuranceForm = useCallback((insurance?: CoverageInsurance) => {
    setModals((prev) => ({
      ...prev,
      insuranceForm: true,
      insuranceEdit: insurance ?? null,
    }));
  }, [setModals]);

  const closeInsuranceForm = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      insuranceForm: false,
      insuranceEdit: null,
    }));
  }, [setModals]);

  const showInsuranceDetails = useCallback((insurance: CoverageInsurance) => {
    setModals((prev) => ({
      ...prev,
      insuranceDetails: insurance,
    }));
  }, [setModals]);

  const hideInsuranceDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      insuranceDetails: null,
    }));
  }, [setModals]);

  const openWarrantyForm = useCallback((warranty?: CoverageWarranty) => {
    setModals((prev) => ({
      ...prev,
      warrantyForm: true,
      warrantyEdit: warranty ?? null,
    }));
  }, [setModals]);

  const closeWarrantyForm = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      warrantyForm: false,
      warrantyEdit: null,
    }));
  }, [setModals]);

  const showWarrantyDetails = useCallback((warranty: CoverageWarranty) => {
    setModals((prev) => ({
      ...prev,
      warrantyDetails: warranty,
    }));
  }, [setModals]);

  const hideWarrantyDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      warrantyDetails: null,
    }));
  }, [setModals]);

  const openClaimForm = useCallback((claim?: CoverageClaim) => {
    setModals((prev) => ({
      ...prev,
      claimForm: true,
      claimEdit: claim ?? null,
    }));
  }, [setModals]);

  const closeClaimForm = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      claimForm: false,
      claimEdit: null,
    }));
  }, [setModals]);

  const showClaimDetails = useCallback((claim: CoverageClaim) => {
    setModals((prev) => ({
      ...prev,
      claimDetails: claim,
    }));
  }, [setModals]);

  const hideClaimDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      claimDetails: null,
    }));
  }, [setModals]);

  const openWorkOrderModal = useCallback((claim: CoverageClaim) => {
    setModals((prev) => ({
      ...prev,
      workOrderFromClaim: true,
      claimForWorkOrder: claim,
    }));
  }, [setModals]);

  const closeWorkOrderModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      workOrderFromClaim: false,
      claimForWorkOrder: null,
    }));
  }, [setModals]);

  return {
    modals,
    openInsuranceForm,
    closeInsuranceForm,
    showInsuranceDetails,
    hideInsuranceDetails,
    openWarrantyForm,
    closeWarrantyForm,
    showWarrantyDetails,
    hideWarrantyDetails,
    openClaimForm,
    closeClaimForm,
    showClaimDetails,
    hideClaimDetails,
    openWorkOrderModal,
    closeWorkOrderModal,
  } as const;
}
