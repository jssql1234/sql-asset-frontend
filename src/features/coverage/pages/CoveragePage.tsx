import React from "react";
import { SidebarLayout } from "@/components/sidebar";
import { Tabs } from "@/components/ui/components";
import { ClaimFormModal } from "@/features/coverage/components/modal/ClaimFormModal";
import { ClaimDetailsModal } from "@/features/coverage/components/modal/ClaimDetailsModal";
import { InsuranceDetailsModal } from "@/features/coverage/components/modal/InsuranceDetailsModal";
import { InsuranceFormModal } from "@/features/coverage/components/modal/InsuranceFormModal";
import { WarrantyDetailsModal } from "@/features/coverage/components/modal/WarrantyDetailsModal";
import { WarrantyFormModal } from "@/features/coverage/components/modal/WarrantyFormModal";
import { WorkOrderFromClaimModal } from "@/features/coverage/components/modal/WorkOrderFromClaimModal";
import { coverageInsurances, insuranceProviders, warrantyProviders, coverageWarranties } from "@/features/coverage/mockData";
import { useCoverageTabs } from "@/features/coverage/hooks/useCoverageTabs";
import { useCoverageState } from "@/features/coverage/hooks/useCoverageState";

const CoveragePage: React.FC = () => {
  const {
    insuranceFilters,
    setInsuranceFilters,
    warrantyFilters,
    setWarrantyFilters,
    claimFilters,
    setClaimFilters,
    modals,
    setModals,
    handleViewInsurance,
    handleCloseInsuranceDetails,
    handleCloseWarrantyDetails,
    handleCloseWorkOrder,
    handleViewWarranty,
    handleViewClaim,
    handleCloseClaimDetails,
} = useCoverageState();

  const tabs = useCoverageTabs({
    insuranceFilters,
    setInsuranceFilters,
    warrantyFilters,
    setWarrantyFilters,
    claimFilters,
    setClaimFilters,
    setModals,
    handleViewInsurance,
    handleViewWarranty,
    handleViewClaim,
  });

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: "Asset Maintenance", href: "/" },
        { label: "Insurance & Warranty" },
      ]}
    >
      <div className="flex flex-col gap-2">
        <Tabs tabs={tabs} defaultValue="insurances" contentClassName="mt-6" />
      </div>

      <InsuranceFormModal
        open={modals.insuranceForm}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, insuranceForm: open }))
        }
        providers={insuranceProviders}
      />

      <InsuranceDetailsModal
        open={Boolean(modals.insuranceDetails)}
        insurance={modals.insuranceDetails}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseInsuranceDetails();
          }
        }}
      />

      <WarrantyFormModal
        open={modals.warrantyForm}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, warrantyForm: open }))
        }
        providers={warrantyProviders}
      />

      <WarrantyDetailsModal
        open={Boolean(modals.warrantyDetails)}
        warranty={modals.warrantyDetails}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseWarrantyDetails();
          }
        }}
      />

      <ClaimFormModal
        open={modals.claimForm}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, claimForm: open }))
        }
        policies={coverageInsurances}
        warranties={coverageWarranties}
      />

      <ClaimDetailsModal
        open={Boolean(modals.claimDetails)}
        claim={modals.claimDetails}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseClaimDetails();
          }
        }}
      />

      <WorkOrderFromClaimModal
        open={modals.workOrderFromClaim}
        onOpenChange={(open) =>
          open
            ? setModals((prev) => ({ ...prev, workOrderFromClaim: open }))
            : handleCloseWorkOrder()
        }
        claim={modals.claimForWorkOrder}
      />
    </SidebarLayout>
  );
};

export default CoveragePage;