import React from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Tabs } from "@/components/ui/components";
import { CoverageFormModal } from "@/features/coverage/components/modal/CoverageFormModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import { WorkOrderFromClaimModal } from "@/features/coverage/components/modal/WorkOrderFromClaimModal";
import { coverageInsurances, insuranceProviders, warrantyProviders, coverageWarranties } from "@/features/coverage/mockData";
import { useCoverageTabs } from "@/features/coverage/hooks/useCoverageTabs";
import { useCoverageState } from "@/features/coverage/hooks/useCoverageState";

const CoveragePage: React.FC = () => {
  const { modals, setModals, handleViewInsurance, handleCloseInsuranceDetails, handleCloseWarrantyDetails, handleCloseWorkOrder, handleViewWarranty, handleViewClaim, handleCloseClaimDetails } = useCoverageState();

  const tabs = useCoverageTabs({ setModals, handleViewInsurance, handleViewWarranty, handleViewClaim });

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

      <CoverageFormModal
        variant="insurance"
        open={modals.insuranceForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, insuranceForm: open }));
        }}
        providers={insuranceProviders}
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

      <CoverageFormModal
        variant="warranty"
        open={modals.warrantyForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, warrantyForm: open }));
        }}
        providers={warrantyProviders}
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

      <CoverageFormModal
        variant="claim"
        open={modals.claimForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, claimForm: open }));
        }}
        policies={coverageInsurances}
        warranties={coverageWarranties}
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
