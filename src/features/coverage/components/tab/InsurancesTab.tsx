import React, { useMemo, useState } from "react";
import TabHeader from "@/components/TabHeader";
import CoverageTable from "@/features/coverage/components/CoverageTable";
import Search from "@/components/Search";
import { InsuranceSummaryCards } from "@/features/coverage/components/CoverageSummaryCards";
import type { CoverageInsurance, InsuranceSummaryMetrics } from "@/features/coverage/types";

interface InsurancesTabProps {
  insurances: CoverageInsurance[];
  summary: InsuranceSummaryMetrics;
  onAddPolicy: () => void;
  onViewInsurance: (insurance: CoverageInsurance) => void;
}

export const InsurancesTab: React.FC<InsurancesTabProps> = ({
  insurances,
  summary,
  onAddPolicy,
  onViewInsurance,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return insurances;

    const query = searchQuery.toLowerCase();
    return insurances.filter((insurance) => 
      insurance.name.toLowerCase().includes(query) ||
      insurance.provider.toLowerCase().includes(query) ||
      insurance.policyNumber.toLowerCase().includes(query) ||
      insurance.status.toLowerCase().includes(query) ||
      insurance.assetsCovered.some((asset) => 
        asset.id.toLowerCase().includes(query) || 
        asset.name.toLowerCase().includes(query)
      )
    );
  }, [insurances, searchQuery]);

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

      <Search
        searchValue={searchQuery}
        searchPlaceholder="Search by policy name, provider, or asset"
        onSearch={setSearchQuery}
        live
      />

      <CoverageTable
        variant="insurances"
        policies={filteredPolicies}
        onViewInsurance={onViewInsurance}
      />
    </div>
  );
};