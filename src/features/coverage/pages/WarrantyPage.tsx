import { useCallback } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import Search from "@/components/Search";
import { WarrantySummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogWarrantyModal } from "@/features/coverage/components/modal/LogWarrantyModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import type { CoverageWarranty, CoverageWarrantyPayload } from "@/features/coverage/types";
import { EMPTY_WARRANTY_SUMMARY } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import { useCoverageModals } from "@/features/coverage/hooks/useCoverageModals";
import { useCoverageSearch } from "@/features/coverage/hooks/useCoverageSearch";
import { useGetWarrantySummary, useCreateWarranty, useUpdateWarranty, useDeleteWarranty } from "@/features/coverage/hooks/useCoverageService";

const WarrantyPage = () => {
  const { warranties } = useCoverageContext();
  const { modals, openWarrantyForm, closeWarrantyForm, showWarrantyDetails, hideWarrantyDetails } = useCoverageModals();
  const { data: warrantySummary = EMPTY_WARRANTY_SUMMARY } = useGetWarrantySummary();

  const createWarranty = useCreateWarranty(closeWarrantyForm);
  const updateWarranty = useUpdateWarranty(closeWarrantyForm);
  const deleteWarranty = useDeleteWarranty(hideWarrantyDetails);

  const matchWarranty = useCallback((warranty: CoverageWarranty, query: string) => (
    warranty.name.toLowerCase().includes(query) ||
    warranty.provider.toLowerCase().includes(query) ||
    warranty.warrantyNumber.toLowerCase().includes(query) ||
    warranty.coverage.toLowerCase().includes(query) ||
    warranty.status.toLowerCase().includes(query) ||
    warranty.assetsCovered.some((asset) =>
      asset.id.toLowerCase().includes(query) ||
      asset.name.toLowerCase().includes(query)
    )
  ), []);

  const { query: searchQuery, setQuery: setSearchQuery, filteredItems: filteredWarranties } = useCoverageSearch(warranties, matchWarranty);

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

        <Search
          searchValue={searchQuery}
          searchPlaceholder="Search by warranty name, provider, or asset"
          onSearch={setSearchQuery}
          live
        />

        <CoverageTable 
          variant="warranties" 
          warranties={filteredWarranties} 
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
