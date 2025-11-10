import { useCallback, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
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
  
  // Track if we've already processed a warranty notification to prevent reopening modal
  const processedWarrantyRef = useRef(false);

  // Handle navigation state from warranty notifications
  useEffect(() => {
    const state = location.state as { openClaimForm?: boolean; warrantyData?: Record<string, unknown> } | null;
    if (state?.openClaimForm && state.warrantyData && !processedWarrantyRef.current) {
      setWarrantyClaimData(state.warrantyData);
      openClaimForm();
      processedWarrantyRef.current = true;
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, openClaimForm]);

  const createClaim = useCreateClaim(closeClaimForm);
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
          }
        }}
        policies={insurances}
        warranties={warranties}
        claim={modals.claimEdit ?? undefined}
        warrantyPrefillData={warrantyClaimData}
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
