import { useCallback, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { ClaimSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogClaimModal } from "@/features/coverage/components/modal/LogClaimModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import { WorkOrderFromClaimModal } from "@/features/coverage/components/modal/WorkOrderFromClaimModal";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import type { CoverageClaim, CoverageClaimPayload } from "@/features/coverage/types";
import { EMPTY_CLAIM_SUMMARY } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import { useCoverageModals } from "@/features/coverage/hooks/useCoverageModals";
import { useGetClaimSummary, useCreateClaim, useUpdateClaim, useDeleteClaim } from "@/features/coverage/hooks/useCoverageService";

const ClaimPage = () => {
  const location = useLocation();
  const { insurances, warranties, claims } = useCoverageContext();
  const {
    modals,
    openClaimForm,
    closeClaimForm,
    showClaimDetails,
    hideClaimDetails,
    openWorkOrderModal,
    closeWorkOrderModal,
  } = useCoverageModals();
  const { data: claimSummary = EMPTY_CLAIM_SUMMARY } = useGetClaimSummary();

  const [claimToDelete, setClaimToDelete] = useState<CoverageClaim | null>(null);
  const [warrantyClaimData, setWarrantyClaimData] = useState<Record<string, unknown> | null>(null);
  const [insuranceClaimData, setInsuranceClaimData] = useState<Record<string, unknown> | null>(null);
  const [notificationId, setNotificationId] = useState<string | undefined>(undefined);

  // Track last handled notification ids so repeated clicks can reopen the modal
  const lastWarrantyNotificationIdRef = useRef<string | undefined>(undefined);
  const lastInsuranceNotificationIdRef = useRef<string | undefined>(undefined);

  const navigate = useNavigate();

  interface WarrantyNotificationData {
    warrantyId?: string;
    warrantyName?: string;
    provider?: string;
    coverage?: string;
    expiryDate?: string;
    assetIds?: string[];
    assets?: { id: string; name: string }[];
    workOrderId?: string;
    workOrderDescription?: string;
  }

  interface InsuranceNotificationData {
    insuranceId?: string;
    insuranceName?: string;
    provider?: string;
    policyNumber?: string;
    expiryDate?: string;
    assetIds?: string[];
    assets?: { id: string; name: string }[];
    remainingCoverage?: number;
    workOrderId?: string;
    workOrderDescription?: string;
  }

  // Handle navigation state from warranty and insurance notifications
  useEffect(() => {
    const state = location.state as {
      openClaimForm?: boolean;
      warrantyId?: string;
      warrantyData?: Record<string, unknown>;
      insuranceId?: string;
      insuranceData?: Record<string, unknown>;
      notificationId?: string;
    } | null;

    const clearNavigationState = () => {
      void navigate(`${location.pathname}${location.search}`, { replace: true });
    };

    // Handle warranty notification
    if (state?.openClaimForm && (state.warrantyData || state.warrantyId)) {
      const stateNotificationId = state.notificationId ?? "__warranty-claim__";
      const alreadyHandled =
        lastWarrantyNotificationIdRef.current === stateNotificationId && modals.claimForm;

      if (!alreadyHandled) {
        const warrantyMetadata = state.warrantyData as WarrantyNotificationData | undefined;
        const warrantyIdFromState = state.warrantyId ?? warrantyMetadata?.warrantyId;
        const latestWarranty = warrantyIdFromState
          ? warranties.find((item) => item.id === warrantyIdFromState)
          : undefined;

        const mergedWarrantyData: Record<string, unknown> = {
          ...(warrantyMetadata ?? {}),
          warrantyId: warrantyIdFromState ?? warrantyMetadata?.warrantyId,
          warrantyName: latestWarranty?.name ?? warrantyMetadata?.warrantyName,
          provider: latestWarranty?.provider ?? warrantyMetadata?.provider,
          coverage: latestWarranty?.coverage ?? warrantyMetadata?.coverage,
          expiryDate: latestWarranty?.expiryDate ?? warrantyMetadata?.expiryDate,
          assetIds:
            warrantyMetadata?.assetIds ??
            latestWarranty?.assetsCovered.map((asset) => asset.id) ??
            [],
          assets:
            warrantyMetadata?.assets ??
            latestWarranty?.assetsCovered ??
            [],
        };

        setWarrantyClaimData(mergedWarrantyData);
        setInsuranceClaimData(null);
        setNotificationId(state.notificationId);
        openClaimForm();
        lastWarrantyNotificationIdRef.current = stateNotificationId;
      }

      clearNavigationState();
    }

    // Handle insurance notification
    if (state?.openClaimForm && (state.insuranceData || state.insuranceId)) {
      const stateNotificationId = state.notificationId ?? "__insurance-claim__";
      const alreadyHandled =
        lastInsuranceNotificationIdRef.current === stateNotificationId && modals.claimForm;

      if (!alreadyHandled) {
        const insuranceMetadata = state.insuranceData as InsuranceNotificationData | undefined;
        const insuranceIdFromState = state.insuranceId ?? insuranceMetadata?.insuranceId;
        const latestInsurance = insuranceIdFromState
          ? insurances.find((item) => item.id === insuranceIdFromState)
          : undefined;

        const mergedInsuranceData: Record<string, unknown> = {
          ...(insuranceMetadata ?? {}),
          insuranceId: insuranceIdFromState ?? insuranceMetadata?.insuranceId,
          insuranceName: latestInsurance?.name ?? insuranceMetadata?.insuranceName,
          provider: latestInsurance?.provider ?? insuranceMetadata?.provider,
          policyNumber: latestInsurance?.policyNumber ?? insuranceMetadata?.policyNumber,
          expiryDate: latestInsurance?.expiryDate ?? insuranceMetadata?.expiryDate,
          assetIds:
            insuranceMetadata?.assetIds ??
            latestInsurance?.assetsCovered.map((asset) => asset.id) ??
            [],
          assets:
            insuranceMetadata?.assets ??
            latestInsurance?.assetsCovered ??
            [],
          remainingCoverage: latestInsurance?.remainingCoverage ?? insuranceMetadata?.remainingCoverage,
        };

        setInsuranceClaimData(mergedInsuranceData);
        setWarrantyClaimData(null);
        setNotificationId(state.notificationId);
        openClaimForm();
        lastInsuranceNotificationIdRef.current = stateNotificationId;
      }

      clearNavigationState();
    }
  }, [insurances, location, modals.claimForm, navigate, openClaimForm, warranties]);

  const createClaim = useCreateClaim(closeClaimForm, notificationId);
  const updateClaim = useUpdateClaim(closeClaimForm);
  const deleteClaim = useDeleteClaim(hideClaimDetails);

  const handleCreateClaim = useCallback(
    (data: CoverageClaimPayload) => {
      createClaim.mutate(data);
    },
    [createClaim]
  );

  const handleUpdateClaim = useCallback(
    (id: string, data: CoverageClaimPayload) => {
      updateClaim.mutate({ id, data });
    },
    [updateClaim]
  );

  const handleDeleteClaim = useCallback(
    (claim: CoverageClaim) => {
      setClaimToDelete(claim);
    },
    []
  );

  const handleConfirmDelete = () => {
    if (claimToDelete) {
      deleteClaim.mutate(claimToDelete.id);
      setClaimToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setClaimToDelete(null);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <TabHeader
          title="Claim Management"
          subtitle="Oversee insurance and warranty claim pipelines"
          actions={[
            {
              label: "Add Claim",
              onAction: () => {
                setNotificationId(undefined); // Reset for manual claim creation
                openClaimForm();
              },
            },
          ]}
        />

        <ClaimSummaryCards summary={claimSummary} />

        <CoverageTable
          variant="claims"
          claims={claims}
          onViewClaim={showClaimDetails}
          onEditClaim={openClaimForm}
          onDeleteClaim={handleDeleteClaim}
        />
      </div>

      <LogClaimModal
        open={modals.claimForm}
        onOpenChange={(open) => {
          if (open) {
            openClaimForm(modals.claimEdit ?? undefined);
          } else {
            closeClaimForm();
            setWarrantyClaimData(null); // Clear warranty data when closing
            setInsuranceClaimData(null); // Clear insurance data when closing
            lastWarrantyNotificationIdRef.current = undefined;
            lastInsuranceNotificationIdRef.current = undefined;
            setNotificationId(undefined);
          }
        }}
        policies={insurances}
        warranties={warranties}
        claim={modals.claimEdit ?? undefined}
        warrantyPrefillData={warrantyClaimData}
        insurancePrefillData={insuranceClaimData}
        onCreate={handleCreateClaim}
        onUpdate={handleUpdateClaim}
      />

      <CoverageDetailsModal
        variant="claim"
        open={Boolean(modals.claimDetails)}
        data={modals.claimDetails}
        onOpenChange={(open: boolean) => {
          if (!open) {
            hideClaimDetails();
          }
        }}
      />

      <WorkOrderFromClaimModal
        open={modals.workOrderFromClaim}
        onOpenChange={(open) => {
          if (open && modals.claimForWorkOrder) {
            openWorkOrderModal(modals.claimForWorkOrder);
          }

          if (!open) {
            closeWorkOrderModal();
          }
        }}
        claim={modals.claimForWorkOrder}
      />

      <DeleteConfirmationDialog
        isOpen={!!claimToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Claim?"
        description="This will permanently remove the claim record and all associated data. This action cannot be undone."
        confirmButtonText="Delete Claim"
        itemIds={claimToDelete?.assets.map((asset) => asset.id) ?? []}
        itemNames={claimToDelete?.assets.map((asset) => `${asset.name} (${asset.id})`) ?? []}
        itemCount={claimToDelete?.assets.length ?? 0}
      />
    </>
  );
};

export default ClaimPage;
