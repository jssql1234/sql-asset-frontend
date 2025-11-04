import { useCallback } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { ClaimSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogClaimModal } from "@/features/coverage/components/modal/LogClaimModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import { WorkOrderFromClaimModal } from "@/features/coverage/components/modal/WorkOrderFromClaimModal";
import type { CoverageClaim, CoverageClaimPayload } from "@/features/coverage/types";
import { EMPTY_CLAIM_SUMMARY } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import { useCoverageModals } from "@/features/coverage/hooks/useCoverageModals";
import { useGetClaimSummary, useCreateClaim, useUpdateClaim, useDeleteClaim } from "@/features/coverage/hooks/useCoverageService";

const ClaimPage = () => {
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
      deleteClaim.mutate(claim.id);
    },
    [deleteClaim]
  );

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
          }
        }}
        policies={insurances}
        warranties={warranties}
        claim={modals.claimEdit ?? undefined}
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
    </>
  );
};

export default ClaimPage;
