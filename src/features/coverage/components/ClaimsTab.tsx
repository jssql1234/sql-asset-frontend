import React, { useMemo } from "react";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/Table";
import { FilterBar } from "@/features/coverage/components/FilterBar";
import type {
  ClaimFilters,
  ClaimSummaryMetrics,
  CoverageClaim,
} from "@/features/coverage/types";
import { formatCurrency } from "@/features/coverage/utils/formatters";

interface ClaimsTabProps {
  claims: CoverageClaim[];
  summary: ClaimSummaryMetrics;
  filters: ClaimFilters;
  onFiltersChange: (filters: Partial<ClaimFilters>) => void;
  onAddClaim: () => void;
  onViewClaim: (claim: CoverageClaim) => void;
}

export const ClaimsTab: React.FC<ClaimsTabProps> = ({
  claims,
  summary,
  filters,
  onFiltersChange,
  onAddClaim,
  onViewClaim,
}) => {
  const summaryCards: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Total Claims",
        value: summary.totalClaims,
        description: "Across policies & warranties",
      },
      {
        label: "Pending Claims",
        value: summary.pendingClaims,
        tone: summary.pendingClaims > 0 ? "warning" : "success",
      },
      {
        label: "Settled Claims",
        value: summary.settledClaims,
        tone: summary.settledClaims > 0 ? "success" : "default",
      },
      {
        label: "Total Settlement Amount",
        value: formatCurrency(summary.totalSettlementAmount),
        description: "Approved payouts",
      },
      {
        label: "Rejected Claims",
        value: summary.rejectedClaims,
        tone: summary.rejectedClaims > 0 ? "danger" : "success",
      },
    ],
    [summary]
  );

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch = filters.search
        ? [
            claim.claimNumber,
            claim.referenceName,
            claim.referenceId,
            claim.description ?? "",
            ...claim.assets.map((asset) => `${asset.id} ${asset.name}`),
          ]
            .join(" ")
            .toLowerCase()
            .includes(filters.search.toLowerCase())
        : true;
      const matchesType = filters.type ? claim.type === filters.type : true;
      const matchesStatus = filters.status ? claim.status === filters.status : true;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [claims, filters]);

  return (
    <div className="flex flex-col gap-6">
      <TabHeader
        title="Claim Management"
        subtitle="Oversee insurance and warranty claim pipelines"
        actions={[
          {
            label: "Add Claim",
            onAction: onAddClaim,
          },
        ]}
      />

      <SummaryCards data={summaryCards} columns={4} />

      <FilterBar
        searchLabel="Search"
        searchPlaceholder="Claim number, asset, or policy"
        searchValue={filters.search}
        onSearchChange={(value) => onFiltersChange({ search: value })}
        dropdowns={[
          {
            id: "type",
            label: "Claim Type",
            value: filters.type,
            placeholder: "All Types",
            options: [
              { label: "All Types", value: "" },
              { label: "Insurance", value: "Insurance" },
              { label: "Warranty", value: "Warranty" },
            ],
            onSelect: (value) => onFiltersChange({ type: value as ClaimFilters["type"] }),
          },
          {
            id: "status",
            label: "Status",
            value: filters.status,
            placeholder: "All Status",
            options: [
              { label: "All Status", value: "" },
              { label: "Filed", value: "Filed" },
              { label: "Approved", value: "Approved" },
              { label: "Settled", value: "Settled" },
              { label: "Rejected", value: "Rejected" },
            ],
            onSelect: (value) =>
              onFiltersChange({ status: value as ClaimFilters["status"] }),
          },
        ]}
        onClear={() =>
          onFiltersChange({
            search: "",
            type: "",
            status: "",
          })
        }
      />

      <CoverageTable
        variant="claims"
        claims={filteredClaims}
        onViewClaim={onViewClaim}
      />
    </div>
  );
};
