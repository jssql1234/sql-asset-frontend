import React, { useMemo } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { CoverageSearchFilter } from "@/features/coverage/components/CoverageSearchFilter";
import { WarrantySummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import type { CoverageWarranty, WarrantyFilters, WarrantySummaryMetrics } from "@/features/coverage/types";

interface WarrantiesTabProps {
  warranties: CoverageWarranty[];
  summary: WarrantySummaryMetrics;
  providers: string[];
  filters: WarrantyFilters;
  onFiltersChange: (filters: Partial<WarrantyFilters>) => void;
  onAddWarranty: () => void;
  onViewWarranty: (warranty: CoverageWarranty) => void;
}

export const WarrantiesTab: React.FC<WarrantiesTabProps> = ({
  warranties,
  summary,
  providers,
  filters,
  onFiltersChange,
  onAddWarranty,
  onViewWarranty,
}) => {
  const filteredWarranties = useMemo(() => {
    return warranties.filter((warranty) => {
      const matchesSearch = filters.search
        ? [
            warranty.name,
            warranty.provider,
            warranty.warrantyNumber,
            warranty.coverage,
            ...warranty.assetsCovered.map((asset) => `${asset.id} ${asset.name}`),
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;
      const matchesStatus = filters.status ? warranty.status === filters.status : true;
      const matchesProvider = filters.provider ? warranty.provider === filters.provider : true;
      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [warranties, filters]);

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

      <CoverageSearchFilter
        searchLabel="Search"
        searchPlaceholder="Warranty name, provider, or asset"
        searchValue={filters.search}
        onSearchChange={(value: string) => onFiltersChange({ search: value })}
        dropdowns={[
          {
            id: "status",
            label: "Status",
            value: filters.status,
            placeholder: "All Status",
            options: [
              { label: "All Status", value: "" },
              { label: "Active", value: "Active" },
              { label: "Expiring Soon", value: "Expiring Soon" },
              { label: "Expired", value: "Expired" },
            ],
            onSelect: (value: string) =>
              onFiltersChange({ status: value as WarrantyFilters["status"] }),
          },
          {
            id: "provider",
            label: "Provider",
            value: filters.provider,
            placeholder: "All Providers",
            options: [
              { label: "All Providers", value: "" },
              ...providers.map((provider) => ({ label: provider, value: provider })),
            ],
            onSelect: (value: string) => onFiltersChange({ provider: value }),
          },
        ]}
        onClear={() =>
          onFiltersChange({
            search: "",
            status: "",
            provider: "",
          })
        }
      />

      <CoverageTable variant="warranties" warranties={filteredWarranties} onViewWarranty={onViewWarranty} />
    </div>
  );
};
