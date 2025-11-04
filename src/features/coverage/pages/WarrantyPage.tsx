import { useCallback } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { WarrantySummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogWarrantyModal } from "@/features/coverage/components/modal/LogWarrantyModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import type { CoverageWarranty, CoverageWarrantyPayload } from "@/features/coverage/types";
import { EMPTY_WARRANTY_SUMMARY } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import { useCoverageModals } from "@/features/coverage/hooks/useCoverageModals";
import { useGetWarrantySummary, useCreateWarranty, useUpdateWarranty, useDeleteWarranty } from "@/features/coverage/hooks/useCoverageService";

const WarrantyPage = () => {
  const { warranties } = useCoverageContext();
  const { modals, openWarrantyForm, closeWarrantyForm, showWarrantyDetails, hideWarrantyDetails } = useCoverageModals();
  const { data: warrantySummary = EMPTY_WARRANTY_SUMMARY } = useGetWarrantySummary();

  const createWarranty = useCreateWarranty(closeWarrantyForm);
  const updateWarranty = useUpdateWarranty(closeWarrantyForm);
  const deleteWarranty = useDeleteWarranty(hideWarrantyDetails);

  const handleCreateWarranty = useCallback((data: CoverageWarrantyPayload) => {
    createWarranty.mutate(data);
  }, [createWarranty]);

  const handleUpdateWarranty = useCallback((id: string, data: CoverageWarrantyPayload) => {
    updateWarranty.mutate({ id, data });
  }, [updateWarranty]);

  const handleDeleteWarranty = useCallback((warranty: CoverageWarranty) => {
    deleteWarranty.mutate(warranty.id);
  }, [deleteWarranty]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <TabHeader
          title="Warranty"
          subtitle="Track manufacturer warranty coverage and renewal windows"
          actions={[
            {
              label: "Add Warranty",
              onAction: () => {
                openWarrantyForm();
              },
            },
          ]}
        />

        <WarrantySummaryCards summary={warrantySummary} />

        <CoverageTable 
          variant="warranties" 
          warranties={warranties}
          onViewWarranty={showWarrantyDetails}
          onEditWarranty={openWarrantyForm}
          onDeleteWarranty={handleDeleteWarranty}
        />
      </div>

      <LogWarrantyModal
        open={modals.warrantyForm}
        onOpenChange={(open) => {
          if (open) {
            openWarrantyForm(modals.warrantyEdit ?? undefined);
          } else {
            closeWarrantyForm();
          }
        }}
        warranty={modals.warrantyEdit ?? undefined}
        onCreate={handleCreateWarranty}
        onUpdate={handleUpdateWarranty}
      />

      <CoverageDetailsModal
        variant="warranty"
        open={Boolean(modals.warrantyDetails)}
        data={modals.warrantyDetails}
        onOpenChange={(open) => {
          if (!open) {
            hideWarrantyDetails();
          }
        }}
      />
    </>
  );
};

export default WarrantyPage;
