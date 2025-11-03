import React from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Tabs } from "@/components/ui/components";
import { LogInsuranceModal } from "@/features/coverage/components/modal/LogInsuranceModal";
import { LogWarrantyModal } from "@/features/coverage/components/modal/LogWarrantyModal";
import { LogClaimModal } from "@/features/coverage/components/modal/LogClaimModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import { WorkOrderFromClaimModal } from "@/features/coverage/components/modal/WorkOrderFromClaimModal";
import { coverageInsurances, coverageWarranties } from "@/features/coverage/mockData";
import { useCoverageState } from "@/features/coverage/hooks/useCoverageState";

const CoveragePage: React.FC = () => {
  const { modals, setModals, handleCloseInsuranceDetails, handleCloseWarrantyDetails, handleCloseWorkOrder, handleCloseClaimDetails, tabs } = useCoverageState();

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Insurance & Warranty" },
      ]}
    >
      <div className="flex flex-col gap-2">
        <Tabs tabs={tabs} defaultValue="insurances" contentClassName="mt-6" />
      </div>

      <LogInsuranceModal
        open={modals.insuranceForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, insuranceForm: open, insuranceEdit: open ? prev.insuranceEdit : null }));
        }}
        insurance={modals.insuranceEdit ?? undefined}
      />

      <CoverageDetailsModal
        variant="insurance"
        open={Boolean(modals.insuranceDetails)}
        data={modals.insuranceDetails}
        onOpenChange={(open: boolean) => {
          if (!open) {
            handleCloseInsuranceDetails();
          }
        }}
      />

      <LogWarrantyModal
        open={modals.warrantyForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, warrantyForm: open, warrantyEdit: open ? prev.warrantyEdit : null }));
        }}
        warranty={modals.warrantyEdit ?? undefined}
      />

      <CoverageDetailsModal
        variant="warranty"
        open={Boolean(modals.warrantyDetails)}
        data={modals.warrantyDetails}
        onOpenChange={(open: boolean) => {
          if (!open) {
            handleCloseWarrantyDetails();
          }
        }}
      />

      <LogClaimModal
        open={modals.claimForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, claimForm: open, claimEdit: open ? prev.claimEdit : null }));
        }}
        policies={coverageInsurances}
        warranties={coverageWarranties}
        claim={modals.claimEdit ?? undefined}
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
    </AppLayout>
  );
};

export default CoveragePage;
