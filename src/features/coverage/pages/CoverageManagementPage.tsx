import React, { useCallback, useMemo, useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { Tabs } from "@/components/ui/components";
import { InsurancesTab } from "@/features/coverage/components/tab/InsurancesTab";
import { WarrantiesTab } from "@/features/coverage/components/tab/WarrantiesTab";
import { ClaimsTab } from "@/features/coverage/components/tab/ClaimsTab";
import { ClaimFormModal } from "@/features/coverage/components/modal/ClaimFormModal";
import { ClaimDetailsModal } from "@/features/coverage/components/modal/ClaimDetailsModal";
import { InsuranceDetailsModal } from "@/features/coverage/components/modal/InsuranceDetailsModal";
import { InsuranceFormModal } from "@/features/coverage/components/modal/InsuranceFormModal";
import { WarrantyDetailsModal } from "@/features/coverage/components/modal/WarrantyDetailsModal";
import { WarrantyFormModal } from "@/features/coverage/components/modal/WarrantyFormModal";
import { WorkOrderFromClaimModal } from "@/features/coverage/components/modal/WorkOrderFromClaimModal";
import { coverageClaims, coverageInsurances, coverageWarranties, claimSummary, insuranceProviders, insuranceSummary, warrantyProviders, warrantySummary } from "@/features/coverage/mockData";
import type { ClaimFilters, CoverageClaim, CoverageModalsState, CoverageWarranty, InsuranceFilters, WarrantyFilters } from "@/features/coverage/types";

const CoverageManagementPage: React.FC = () => {
  const [insuranceFilters, setInsuranceFilters] = useState<InsuranceFilters>({
    search: "",
    status: "",
    provider: "",
  });

  const [warrantyFilters, setWarrantyFilters] = useState<WarrantyFilters>({
    search: "",
    status: "",
    provider: "",
  });

  const [claimFilters, setClaimFilters] = useState<ClaimFilters>({
    search: "",
    type: "",
    status: "",
  });

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
    [setModals]
  );

  const handleCloseInsuranceDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      insuranceDetails: null,
    }));
  }, [setModals]);

  const handleCloseWarrantyDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      warrantyDetails: null,
    }));
  }, [setModals]);

  const handleCloseWorkOrder = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      workOrderFromClaim: false,
      claimForWorkOrder: null,
    }));
  }, [setModals]);

  const handleViewWarranty = useCallback(
    (warranty: CoverageWarranty) => {
      setModals((prev) => ({
        ...prev,
        warrantyDetails: warranty,
      }));
    },
    [setModals]
  );

  const handleViewClaim = useCallback(
    (claim: CoverageClaim) => {
      setModals((prev) => ({
        ...prev,
        claimDetails: claim,
      }));
    },
    [setModals]
  );

  const handleCloseClaimDetails = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      claimDetails: null,
    }));
  }, [setModals]);

  const tabs = useMemo(
    () => [
      {
        label: "Insurance Policies",
        value: "policies",
        content: (
          <InsurancesTab
            insurances={coverageInsurances}
            summary={insuranceSummary}
            providers={insuranceProviders}
            filters={insuranceFilters}
            onFiltersChange={(filters) =>
              setInsuranceFilters((prev) => ({ ...prev, ...filters }))
            }
            onAddPolicy={() =>
              setModals((prev) => ({ ...prev, policyForm: true }))
            }
            onViewInsurance={handleViewInsurance}
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
            providers={warrantyProviders}
            filters={warrantyFilters}
            onFiltersChange={(filters) =>
              setWarrantyFilters((prev) => ({ ...prev, ...filters }))
            }
            onAddWarranty={() =>
              setModals((prev) => ({ ...prev, warrantyForm: true }))
            }
            onViewWarranty={handleViewWarranty}
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
            filters={claimFilters}
            onFiltersChange={(filters) =>
              setClaimFilters((prev) => ({ ...prev, ...filters }))
            }
            onAddClaim={() =>
              setModals((prev) => ({ ...prev, claimForm: true }))
            }
            onViewClaim={handleViewClaim}
          />
        ),
      },
    ],
    [
      claimFilters,
      handleViewClaim,
      handleViewInsurance,
      handleViewWarranty,
      insuranceFilters,
      setClaimFilters,
      setModals,
      setInsuranceFilters,
      setWarrantyFilters,
      warrantyFilters,
    ]
  );

  return (
    <AssetLayout activeSidebarItem="insurance">
      <div className="flex flex-col gap-2">
        <Tabs tabs={tabs} defaultValue="policies" contentClassName="mt-6" />
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
    </AssetLayout>
  );
};

export default CoverageManagementPage;
