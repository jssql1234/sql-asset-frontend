import { useCallback } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { InsuranceSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogInsuranceModal } from "@/features/coverage/components/modal/LogInsuranceModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import type { CoverageInsurance, CoverageInsurancePayload } from "@/features/coverage/types";
import { EMPTY_INSURANCE_SUMMARY } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import { useCoverageModals } from "@/features/coverage/hooks/useCoverageModals";
import { useGetInsuranceSummary, useCreateInsurance, useUpdateInsurance, useDeleteInsurance } from "@/features/coverage/hooks/useCoverageService";

const InsurancePage = () => {
  const { insurances } = useCoverageContext();
  const { modals, openInsuranceForm, closeInsuranceForm, showInsuranceDetails, hideInsuranceDetails } = useCoverageModals();
  const { data: insuranceSummary = EMPTY_INSURANCE_SUMMARY } = useGetInsuranceSummary();

  const createInsurance = useCreateInsurance(closeInsuranceForm);
  const updateInsurance = useUpdateInsurance(closeInsuranceForm);
  const deleteInsurance = useDeleteInsurance(hideInsuranceDetails);

  const handleCreateInsurance = useCallback((data: CoverageInsurancePayload) => {
    createInsurance.mutate(data);
  }, [createInsurance]);

  const handleUpdateInsurance = useCallback((id: string, data: CoverageInsurancePayload) => {
    updateInsurance.mutate({ id, data });
  }, [updateInsurance]);

  const handleDeleteInsurance = useCallback((insurance: CoverageInsurance) => {
    deleteInsurance.mutate(insurance.id);
  }, [deleteInsurance]);

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
                openInsuranceForm();
              },
            },
          ]}
        />

        <InsuranceSummaryCards summary={insuranceSummary} />

        <CoverageTable
          variant="insurances"
          policies={insurances}
          onViewInsurance={showInsuranceDetails}
          onEditInsurance={openInsuranceForm}
          onDeleteInsurance={handleDeleteInsurance}
        />
      </div>

      <LogInsuranceModal
        open={modals.insuranceForm}
        onOpenChange={(open) => {
          if (open) {
            openInsuranceForm(modals.insuranceEdit ?? undefined);
          } else {
            closeInsuranceForm();
          }
        }}
        insurance={modals.insuranceEdit ?? undefined}
        onCreate={handleCreateInsurance}
        onUpdate={handleUpdateInsurance}
      />

      <CoverageDetailsModal
        variant="insurance"
        open={Boolean(modals.insuranceDetails)}
        data={modals.insuranceDetails}
        onOpenChange={(open) => {
          if (!open) {
            hideInsuranceDetails();
          }
        }}
      />
    </>
  );
};

export default InsurancePage;
