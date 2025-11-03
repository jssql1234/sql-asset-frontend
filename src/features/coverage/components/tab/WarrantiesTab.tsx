import React, { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import Search from "@/components/Search";
import { WarrantySummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import type { CoverageWarranty, WarrantySummaryMetrics } from "@/features/coverage/types";

interface WarrantiesTabProps {
  warranties: CoverageWarranty[];
  summary: WarrantySummaryMetrics;
  onAddWarranty: () => void;
  onViewWarranty: (warranty: CoverageWarranty) => void;
  onEditWarranty: (warranty: CoverageWarranty) => void;
  onDeleteWarranty: (warranty: CoverageWarranty) => void;
}

export const WarrantiesTab: React.FC<WarrantiesTabProps> = ({
  warranties,
  summary,
  onAddWarranty,
  onViewWarranty,
  onEditWarranty,
  onDeleteWarranty,
}) => {
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

  return (
    <div className="flex flex-col gap-6">
      <TabHeader
        title="Warranty"
        subtitle="Track manufacturer warranty coverage and renewal windows"
        actions={[
          {
            label: "Add Warranty",
            onAction: onAddWarranty,
          },
        ]}
      />

      <WarrantySummaryCards summary={summary} />

      <Search
        searchValue={searchQuery}
        searchPlaceholder="Search by warranty name, provider, or asset"
        onSearch={setSearchQuery}
        live
      />

      <CoverageTable 
        variant="warranties" 
        warranties={filteredWarranties} 
        onViewWarranty={onViewWarranty}
        onEditWarranty={onEditWarranty}
        onDeleteWarranty={onDeleteWarranty}
      />
    </div>
  );
};
