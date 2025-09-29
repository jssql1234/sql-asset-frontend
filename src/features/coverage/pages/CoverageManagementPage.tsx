import React, { useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { Tabs } from "@/components/ui/components";
import { PoliciesTab } from "@/features/coverage/components/PoliciesTab";
import { WarrantiesTab } from "@/features/coverage/components/WarrantiesTab";
import { ClaimsTab } from "@/features/coverage/components/ClaimsTab";
import { ClaimFormModal } from "@/features/coverage/components/modal/ClaimFormModal";
import { PolicyDetailsModal } from "@/features/coverage/components/modal/PolicyDetailsModal";
import { PolicyFormModal } from "@/features/coverage/components/modal/PolicyFormModal";
import { WarrantyFormModal } from "@/features/coverage/components/modal/WarrantyFormModal";
import { WorkOrderFromClaimModal } from "@/features/coverage/components/modal/WorkOrderFromClaimModal";
import {
  coverageClaims,
  coveragePolicies,
  coverageWarranties,
  claimSummary,
  policyProviders,
  policySummary,
  warrantyProviders,
  warrantySummary,
} from "@/features/coverage/mockData";
import type {
  ClaimFilters,
  CoverageClaim,
  CoverageModalsState,
  PolicyFilters,
  WarrantyFilters,
} from "@/features/coverage/types";

const CoverageManagementPage: React.FC = () => {
  const [policyFilters, setPolicyFilters] = useState<PolicyFilters>({
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
    policyForm: false,
    policyDetails: null,
    warrantyForm: false,
    claimForm: false,
    workOrderFromClaim: false,
    claimForWorkOrder: null,
  });

  const handleViewPolicy = (policy: CoverageModalsState["policyDetails"]) => {
    setModals((prev) => ({
      ...prev,
      policyDetails: policy,
    }));
  };

  const handleClosePolicyDetails = () => {
    setModals((prev) => ({
      ...prev,
      policyDetails: null,
    }));
  };

  const handleCreateWorkOrder = (claim: CoverageClaim) => {
    setModals((prev) => ({
      ...prev,
      workOrderFromClaim: true,
      claimForWorkOrder: claim,
    }));
  };

  const handleCloseWorkOrder = () => {
    setModals((prev) => ({
      ...prev,
      workOrderFromClaim: false,
      claimForWorkOrder: null,
    }));
  };

  const tabs = [
    {
      label: "Insurance Policies",
      value: "policies",
      content: (
        <PoliciesTab
          policies={coveragePolicies}
          summary={policySummary}
          providers={policyProviders}
          filters={policyFilters}
          onFiltersChange={(filters) =>
            setPolicyFilters((prev) => ({ ...prev, ...filters }))
          }
          onAddPolicy={() =>
            setModals((prev) => ({ ...prev, policyForm: true }))
          }
          onViewPolicy={handleViewPolicy}
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
          onCreateWorkOrder={handleCreateWorkOrder}
        />
      ),
    },
  ];

  return (
    <AssetLayout activeSidebarItem="insurance">
      <div className="flex flex-col gap-2">
        <Tabs tabs={tabs} defaultValue="policies" contentClassName="mt-6" />
      </div>

      <PolicyFormModal
        open={modals.policyForm}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, policyForm: open }))
        }
        providers={policyProviders}
      />

      <PolicyDetailsModal
        open={Boolean(modals.policyDetails)}
        policy={modals.policyDetails}
        onOpenChange={(open) => {
          if (!open) {
            handleClosePolicyDetails();
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

      <ClaimFormModal
        open={modals.claimForm}
        onOpenChange={(open) =>
          setModals((prev) => ({ ...prev, claimForm: open }))
        }
        policies={coveragePolicies}
        warranties={coverageWarranties}
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
