import { useMemo, useState, useCallback } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import Search from "@/components/Search";
import { ClaimSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogClaimModal } from "@/features/coverage/components/modal/LogClaimModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import { WorkOrderFromClaimModal } from "@/features/coverage/components/modal/WorkOrderFromClaimModal";
import type { CoverageClaim } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import { useGetClaimSummary, useCreateClaim, useUpdateClaim, useDeleteClaim } from "@/features/coverage/hooks/useCoverageService";

const ClaimPage = () => {
  const { insurances, warranties, claims, modals, setModals } = useCoverageContext();
  const { data: claimSummary = {
    totalClaims: 0,
    pendingClaims: 0,
    settledClaims: 0,
    totalSettlementAmount: 0,
    rejectedClaims: 0,
  } } = useGetClaimSummary();

  const createClaim = useCreateClaim();
  const updateClaim = useUpdateClaim();
  const deleteClaim = useDeleteClaim();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredClaims = useMemo(() => {
    if (!searchQuery.trim()) return claims;

    const query = searchQuery.toLowerCase();
    return claims.filter((claim) => 
      claim.claimNumber.toLowerCase().includes(query) ||
      claim.referenceName.toLowerCase().includes(query) ||
      claim.referenceId.toLowerCase().includes(query) ||
      (claim.description?.toLowerCase().includes(query) ?? false) ||
      claim.type.toLowerCase().includes(query) ||
      claim.status.toLowerCase().includes(query) ||
      claim.assets.some((asset) => 
        asset.id.toLowerCase().includes(query) || 
        asset.name.toLowerCase().includes(query)
      )
    );
  }, [claims, searchQuery]);

  const handleCreateClaim = useCallback((data: Omit<CoverageClaim, 'id'>) => {
    createClaim.mutate(data, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, claimForm: false, claimEdit: null }));
      },
    });
  }, [createClaim, setModals]);

  const handleUpdateClaim = useCallback((id: string, data: Omit<CoverageClaim, 'id'>) => {
    updateClaim.mutate({ id, data }, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, claimForm: false, claimEdit: null }));
      },
    });
  }, [updateClaim, setModals]);

  const handleDeleteClaim = useCallback((claim: CoverageClaim) => {
    deleteClaim.mutate(claim.id, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, claimDetails: null }));
      },
    });
  }, [deleteClaim, setModals]);

  const handleViewClaim = useCallback((claim: CoverageClaim) => {
    setModals(prev => ({ ...prev, claimDetails: claim }));
  }, [setModals]);

  const handleEditClaim = useCallback((claim: CoverageClaim) => {
    setModals(prev => ({ ...prev, claimForm: true, claimEdit: claim }));
  }, [setModals]);

  const handleCloseClaimDetails = useCallback(() => {
    setModals(prev => ({ ...prev, claimDetails: null }));
  }, [setModals]);

  const handleCloseWorkOrder = useCallback(() => {
    setModals(prev => ({ ...prev, workOrderFromClaim: false, claimForWorkOrder: null }));
  }, [setModals]);

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
                setModals(prev => ({ ...prev, claimForm: true }));
              },
            },
          ]}
        />

        <ClaimSummaryCards summary={claimSummary} />

        <Search searchValue={searchQuery} searchPlaceholder="Search by claim number, asset, or policy" onSearch={setSearchQuery} live/>

        <CoverageTable variant="claims" claims={filteredClaims} onViewClaim={handleViewClaim} onEditClaim={handleEditClaim} onDeleteClaim={handleDeleteClaim}/>
      </div>

      <LogClaimModal
        open={modals.claimForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, claimForm: open, claimEdit: open ? prev.claimEdit : null }));
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
            handleCloseClaimDetails();
          }
        }}
      />

      <WorkOrderFromClaimModal
        open={modals.workOrderFromClaim}
        onOpenChange={(open) => {
          if (open) {
            setModals((prev) => ({ ...prev, workOrderFromClaim: open }));
          } else {
            handleCloseWorkOrder();
          }
        }}
        claim={modals.claimForWorkOrder}
      />
    </>
  );
};

export default ClaimPage;
