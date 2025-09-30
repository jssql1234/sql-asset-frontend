import React, { useMemo } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { CoverageSearchFilter } from "@/features/coverage/components/CoverageSearchFilter";
import { InsuranceSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import type { CoverageInsurance, InsuranceFilters, InsuranceSummaryMetrics } from "@/features/coverage/types";

interface InsurancesTabProps {
  insurances: CoverageInsurance[];
  summary: InsuranceSummaryMetrics;
  providers: string[];
  filters: InsuranceFilters;
  onFiltersChange: (filters: Partial<InsuranceFilters>) => void;
  onAddPolicy: () => void;
  onViewInsurance: (insurance: CoverageInsurance) => void;
}

export const InsurancesTab: React.FC<InsurancesTabProps> = ({
  insurances,
  summary,
  providers,
  filters,
  onFiltersChange,
  onAddPolicy,
  onViewInsurance,
}) => {
  const filteredPolicies = useMemo(() => {
    return insurances.filter((insurance) => {
      const matchesSearch = filters.search
        ? [
            insurance.name,
            insurance.provider,
            insurance.policyNumber,
            ...insurance.assetsCovered.map((asset) => `${asset.id} ${asset.name}`),
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;
      const matchesStatus = filters.status ? insurance.status === filters.status : true;
      const matchesProvider = filters.provider ? insurance.provider === filters.provider : true;
      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [insurances, filters]);

  return (
    <div className="flex flex-col gap-6">
      <TabHeader
        title="Insurance Policy"
        subtitle="Monitor coverage limits, premiums, and asset protection"
        actions={[
          {
            label: "Add Policy",
            onAction: onAddPolicy,
          },
        ]}
      />

      <InsuranceSummaryCards summary={summary} />

      <CoverageSearchFilter
        searchLabel="Search"
        searchPlaceholder="Policy name, provider, or asset"
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
            onSelect: (value: string) => onFiltersChange({ status: value as InsuranceFilters["status"] }),
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

      <CoverageTable
        variant="policies"
        policies={filteredPolicies}
        onViewInsurance={onViewInsurance}
      />
    </div>
  );
};
