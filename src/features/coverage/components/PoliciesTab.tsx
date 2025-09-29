import React, { useMemo } from "react";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import { Badge, Button, Card } from "@/components/ui/components";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/components/Table";
import { FilterBar } from "@/features/coverage/components/FilterBar";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type {
  CoveragePolicy,
  PolicyFilters,
  PolicySummaryMetrics,
} from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="title-large font-semibold text-onSurface">Insurance Policy</h2>
          <p className="body-medium text-onSurfaceVariant">
            Monitor coverage limits, premiums, and asset protection
          </p>
        </div>
        <Button variant="default" onClick={onAddPolicy}>
          Add Policy
        </Button>
      </div>

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

      <Card className="mt-0 p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy</TableHead>
              <TableHead className="text-right">Available Coverage</TableHead>
              <TableHead className="text-right">Annual Premium</TableHead>
              <TableHead className="text-right">Total Claimed</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-onSurfaceVariant py-10">
                  No policies match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-onSurface">{policy.name}</span>
                      <span className="body-small text-onSurfaceVariant">
                        {policy.provider} • {policy.policyNumber}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(policy.remainingCoverage)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(policy.annualPremium)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(policy.totalClaimed)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(policy.expiryDate)}</span>
                      <span className="body-small text-onSurfaceVariant">
                        {policy.status === "Expiring Soon" && "Renew within 30 days"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={policy.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {policy.assetsCovered.map((asset) => (
                        <Badge
                          key={asset.id}
                          text={asset.name}
                          variant="grey"
                          className="h-7 px-3 py-1"
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onViewPolicy(policy)}>
                        View
                      </Button>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
