import React, { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import Search from "@/components/Search";
import { ClaimSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import type { ClaimSummaryMetrics, CoverageClaim } from "@/features/coverage/types";

interface ClaimsTabProps {
  claims: CoverageClaim[];
  summary: ClaimSummaryMetrics;
  onAddClaim: () => void;
  onViewClaim: (claim: CoverageClaim) => void;
}

export const ClaimsTab: React.FC<ClaimsTabProps> = ({
  claims,
  summary,
  onAddClaim,
  onViewClaim,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClaims = useMemo(() => {
    if (!searchQuery.trim()) return claims;

    const query = searchQuery.toLowerCase();
    return claims.filter((claim) => 
      claim.claimNumber.toLowerCase().includes(query) ||
      claim.referenceName.toLowerCase().includes(query) ||
      claim.referenceId.toLowerCase().includes(query) ||
      (claim.description && claim.description.toLowerCase().includes(query)) ||
      claim.type.toLowerCase().includes(query) ||
      claim.status.toLowerCase().includes(query) ||
      claim.assets.some((asset) => 
        asset.id.toLowerCase().includes(query) || 
        asset.name.toLowerCase().includes(query)
      )
    );
  }, [claims, searchQuery]);

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

      <Search
        searchValue={searchQuery}
        searchPlaceholder="Search by claim number, asset, or policy"
        onSearch={setSearchQuery}
        live
      />

      <CoverageTable
        variant="claims"
        claims={filteredClaims}
        onViewClaim={onViewClaim}
      />
    </div>
  );
};