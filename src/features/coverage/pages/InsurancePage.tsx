import { useMemo, useState, useCallback } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import Search from "@/components/Search";
import { InsuranceSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogInsuranceModal } from "@/features/coverage/components/modal/LogInsuranceModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import type { CoverageInsurance } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import {
  useGetInsuranceSummary,
  useCreateInsurance,
  useUpdateInsurance,
  useDeleteInsurance,
} from "@/features/coverage/hooks/useCoverageService";

const InsurancePage = () => {
  const { insurances, modals, setModals } = useCoverageContext();
  const { data: insuranceSummary = {
    activeInsurances: 0,
    totalCoverage: 0,
    remainingCoverage: 0,
    annualPremiums: 0,
    assetsCovered: 0,
    assetsNotCovered: 0,
    expiringSoon: 0,
    expired: 0,
  } } = useGetInsuranceSummary();

  const createInsurance = useCreateInsurance();
  const updateInsurance = useUpdateInsurance();
  const deleteInsurance = useDeleteInsurance();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return insurances;

    const query = searchQuery.toLowerCase();
    return insurances.filter((insurance) => 
      insurance.name.toLowerCase().includes(query) ||
      insurance.provider.toLowerCase().includes(query) ||
      insurance.policyNumber.toLowerCase().includes(query) ||
      insurance.status.toLowerCase().includes(query) ||
      insurance.assetsCovered.some((asset) => 
        asset.id.toLowerCase().includes(query) || 
        asset.name.toLowerCase().includes(query)
      )
    );
  }, [insurances, searchQuery]);

  const handleCreateInsurance = useCallback((data: Omit<CoverageInsurance, 'id' | 'status' | 'totalClaimed'>) => {
    createInsurance.mutate(data, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, insuranceForm: false, insuranceEdit: null }));
      },
    });
  }, [createInsurance, setModals]);

  const handleUpdateInsurance = useCallback((id: string, data: Omit<CoverageInsurance, 'id' | 'status' | 'totalClaimed'>) => {
    updateInsurance.mutate({ id, data }, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, insuranceForm: false, insuranceEdit: null }));
      },
    });
  }, [updateInsurance, setModals]);

  const handleDeleteInsurance = useCallback((insurance: CoverageInsurance) => {
    deleteInsurance.mutate(insurance.id, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, insuranceDetails: null }));
      },
    });
  }, [deleteInsurance, setModals]);

  const handleViewInsurance = useCallback((insurance: CoverageInsurance) => {
    setModals(prev => ({ ...prev, insuranceDetails: insurance }));
  }, [setModals]);

  const handleEditInsurance = useCallback((insurance: CoverageInsurance) => {
    setModals(prev => ({ ...prev, insuranceForm: true, insuranceEdit: insurance }));
  }, [setModals]);

  const handleCloseInsuranceDetails = useCallback(() => {
    setModals(prev => ({ ...prev, insuranceDetails: null }));
  }, [setModals]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <TabHeader
          title="Insurance Policy"
          subtitle="Monitor coverage limits, premiums, and asset protection"
          actions={[
            {
              label: "Add Policy",
              onAction: () => {
                setModals(prev => ({ ...prev, insuranceForm: true }));
              },
            },
          ]}
        />

        <InsuranceSummaryCards summary={insuranceSummary} />

        <Search
          searchValue={searchQuery}
          searchPlaceholder="Search by policy name, provider, or asset"
          onSearch={setSearchQuery}
          live
        />

        <CoverageTable
          variant="insurances"
          policies={filteredPolicies}
          onViewInsurance={handleViewInsurance}
          onEditInsurance={handleEditInsurance}
          onDeleteInsurance={handleDeleteInsurance}
        />
      </div>

      <LogInsuranceModal
        open={modals.insuranceForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, insuranceForm: open, insuranceEdit: open ? prev.insuranceEdit : null }));
        }}
        insurance={modals.insuranceEdit ?? undefined}
        onCreate={handleCreateInsurance}
        onUpdate={handleUpdateInsurance}
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
    </>
  );
};

export default InsurancePage;
