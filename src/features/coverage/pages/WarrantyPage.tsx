import { useMemo, useState, useCallback } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import Search from "@/components/Search";
import { WarrantySummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import { LogWarrantyModal } from "@/features/coverage/components/modal/LogWarrantyModal";
import { CoverageDetailsModal } from "@/features/coverage/components/modal/CoverageDetailsModal";
import type { CoverageWarranty } from "@/features/coverage/types";
import { useCoverageContext } from "@/features/coverage/hooks/useCoverageContext";
import {
  useGetWarrantySummary,
  useCreateWarranty,
  useUpdateWarranty,
  useDeleteWarranty,
} from "@/features/coverage/hooks/useCoverageService";

const WarrantyPage = () => {
  const { warranties, modals, setModals } = useCoverageContext();
  const { data: warrantySummary = {
    activeWarranties: 0,
    assetsCovered: 0,
    assetsNotCovered: 0,
    expiringSoon: 0,
    expired: 0,
  } } = useGetWarrantySummary();

  const createWarranty = useCreateWarranty();
  const updateWarranty = useUpdateWarranty();
  const deleteWarranty = useDeleteWarranty();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredWarranties = useMemo(() => {
    if (!searchQuery.trim()) return warranties;

    const query = searchQuery.toLowerCase();
    return warranties.filter((warranty) => 
      warranty.name.toLowerCase().includes(query) ||
      warranty.provider.toLowerCase().includes(query) ||
      warranty.warrantyNumber.toLowerCase().includes(query) ||
      warranty.coverage.toLowerCase().includes(query) ||
      warranty.status.toLowerCase().includes(query) ||
      warranty.assetsCovered.some((asset) => 
        asset.id.toLowerCase().includes(query) || 
        asset.name.toLowerCase().includes(query)
      )
    );
  }, [warranties, searchQuery]);

  const handleCreateWarranty = useCallback((data: Omit<CoverageWarranty, 'id' | 'status'>) => {
    createWarranty.mutate(data, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, warrantyForm: false, warrantyEdit: null }));
      },
    });
  }, [createWarranty, setModals]);

  const handleUpdateWarranty = useCallback((id: string, data: Omit<CoverageWarranty, 'id' | 'status'>) => {
    updateWarranty.mutate({ id, data }, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, warrantyForm: false, warrantyEdit: null }));
      },
    });
  }, [updateWarranty, setModals]);

  const handleDeleteWarranty = useCallback((warranty: CoverageWarranty) => {
    deleteWarranty.mutate(warranty.id, {
      onSuccess: () => {
        setModals(prev => ({ ...prev, warrantyDetails: null }));
      },
    });
  }, [deleteWarranty, setModals]);

  const handleViewWarranty = useCallback((warranty: CoverageWarranty) => {
    setModals(prev => ({ ...prev, warrantyDetails: warranty }));
  }, [setModals]);

  const handleEditWarranty = useCallback((warranty: CoverageWarranty) => {
    setModals(prev => ({ ...prev, warrantyForm: true, warrantyEdit: warranty }));
  }, [setModals]);

  const handleCloseWarrantyDetails = useCallback(() => {
    setModals(prev => ({ ...prev, warrantyDetails: null }));
  }, [setModals]);

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
                setModals(prev => ({ ...prev, warrantyForm: true }));
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
          onViewWarranty={handleViewWarranty}
          onEditWarranty={handleEditWarranty}
          onDeleteWarranty={handleDeleteWarranty}
        />
      </div>

      <LogWarrantyModal
        open={modals.warrantyForm}
        onOpenChange={(open: boolean) => {
          setModals((prev) => ({ ...prev, warrantyForm: open, warrantyEdit: open ? prev.warrantyEdit : null }));
        }}
        warranty={modals.warrantyEdit ?? undefined}
        onCreate={handleCreateWarranty}
        onUpdate={handleUpdateWarranty}
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
    </>
  );
};

export default WarrantyPage;
