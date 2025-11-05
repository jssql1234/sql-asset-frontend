import { useCallback, useState } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { WarrantySummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogWarrantyModal } from "@/features/coverage/components/modal/LogWarrantyModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import type { CoverageWarranty, CoverageWarrantyPayload } from "@/features/coverage/types";
import { EMPTY_WARRANTY_SUMMARY } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import { useCoverageModals } from "@/features/coverage/hooks/useCoverageModals";
import { useGetWarrantySummary, useCreateWarranty, useUpdateWarranty, useDeleteWarranty } from "@/features/coverage/hooks/useCoverageService";

const WarrantyPage = () => {
  const { warranties } = useCoverageContext();
  const { modals, openWarrantyForm, closeWarrantyForm, showWarrantyDetails, hideWarrantyDetails } = useCoverageModals();
  const { data: warrantySummary = EMPTY_WARRANTY_SUMMARY } = useGetWarrantySummary();

  const [warrantyToDelete, setWarrantyToDelete] = useState<CoverageWarranty | null>(null);

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
    setWarrantyToDelete(warranty);
  }, []);

  const handleConfirmDelete = () => {
    if (warrantyToDelete) {
      deleteWarranty.mutate(warrantyToDelete.id);
      setWarrantyToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setWarrantyToDelete(null);
  };

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

      <DeleteConfirmationDialog
        isOpen={!!warrantyToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Warranty?"
        description="This will permanently remove the warranty and all associated coverage data. This action cannot be undone."
        confirmButtonText="Delete Warranty"
        itemIds={warrantyToDelete?.assetsCovered.map((asset) => asset.id) ?? []}
        itemNames={warrantyToDelete?.assetsCovered.map((asset) => `${asset.name} (${asset.id})`) ?? []}
        itemCount={warrantyToDelete?.assetsCovered.length ?? 0}
      />
    </>
  );
};

export default WarrantyPage;
