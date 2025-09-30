import React, { useMemo } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import { ClaimSearchFilter } from "@/features/coverage/components/CoverageSearchFilters";
import { ClaimSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import type { ClaimFilters, ClaimSummaryMetrics, CoverageClaim } from "@/features/coverage/types";

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

      <ClaimSummaryCards summary={summary} />

      <ClaimSearchFilter
        filters={filters}
        onFiltersChange={onFiltersChange}
      />

      <CoverageTable
        variant="claims"
        claims={filteredClaims}
        onViewClaim={onViewClaim}
      />
    </div>
  );
};
