import React, { useMemo } from "react";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/Table";
import { FilterBar } from "@/features/coverage/components/FilterBar";
import type {
  CoveragePolicy,
  PolicyFilters,
  PolicySummaryMetrics,
} from "@/features/coverage/types";
import { formatCurrency } from "@/features/coverage/utils/formatters";

interface PoliciesTabProps {
  policies: CoveragePolicy[];
  summary: PolicySummaryMetrics;
  providers: string[];
  filters: PolicyFilters;
  onFiltersChange: (filters: Partial<PolicyFilters>) => void;
  onAddPolicy: () => void;
  onViewPolicy: (policy: CoveragePolicy) => void;
}

export const PoliciesTab: React.FC<PoliciesTabProps> = ({
  policies,
  summary,
  providers,
  filters,
  onFiltersChange,
  onAddPolicy,
  onViewPolicy,
}) => {
  const summaryCards: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Active Policies",
        value: summary.activePolicies,
        description: "In-force coverage",
        tone: summary.activePolicies > 0 ? "success" : "default",
      },
      {
        label: "Total Coverage",
        value: formatCurrency(summary.totalCoverage),
        description: "Aggregate limit",
      },
      {
        label: "Remaining Coverage",
        value: formatCurrency(summary.remainingCoverage),
        description: "Available balance",
      },
      {
        label: "Annual Premiums",
        value: formatCurrency(summary.annualPremiums),
        description: "Per fiscal year",
      },
      {
        label: "Assets Covered",
        value: summary.assetsCovered,
        description: "Across all policies",
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
        label: "Expired Policies",
        value: summary.expired,
        tone: summary.expired > 0 ? "danger" : "success",
      },
    ],
    [summary]
  );

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const matchesSearch = filters.search
        ? [
            policy.name,
            policy.provider,
            policy.policyNumber,
            ...policy.assetsCovered.map((asset) => `${asset.id} ${asset.name}`),
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;
      const matchesStatus = filters.status ? policy.status === filters.status : true;
      const matchesProvider = filters.provider ? policy.provider === filters.provider : true;
      return matchesSearch && matchesStatus && matchesProvider;
    });
  }, [policies, filters]);

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

      <SummaryCards data={summaryCards} columns={4} />

      <FilterBar
        searchLabel="Search"
        searchPlaceholder="Policy name, provider, or asset"
        searchValue={filters.search}
        onSearchChange={(value) => onFiltersChange({ search: value })}
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
            onSelect: (value) => onFiltersChange({ status: value as PolicyFilters["status"] }),
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
            onSelect: (value) => onFiltersChange({ provider: value }),
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
        onViewPolicy={onViewPolicy}
      />
    </div>
  );
};
