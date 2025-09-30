import React, { useMemo } from "react";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { CoverageSearchFilter } from "@/features/coverage/components/CoverageSearchFilter";
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
  const summaryCards: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Active Warranties",
        value: summary.activeWarranties,
        description: "Currently in coverage",
        tone: summary.activeWarranties > 0 ? "success" : "default",
      },
      {
        label: "Assets Covered",
        value: summary.assetsCovered,
        description: "Equipment protected",
      },
      {
        label: "Assets Not Covered",
        value: summary.assetsNotCovered,
        tone: summary.assetsNotCovered > 0 ? "warning" : "success",
      },
      {
        label: "Expiring Soon (30d)",
        value: summary.expiringSoon,
        tone: summary.expiringSoon > 0 ? "warning" : "success",
      },
      {
        label: "Expired Warranties",
        value: summary.expired,
        tone: summary.expired > 0 ? "danger" : "success",
      },
    ],
    [summary]
  );

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

      <SummaryCards data={summaryCards} columns={4} />

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
