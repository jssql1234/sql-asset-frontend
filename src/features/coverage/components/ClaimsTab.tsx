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
  ClaimFilters,
  ClaimSummaryMetrics,
  CoverageClaim,
} from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

interface ClaimsTabProps {
  claims: CoverageClaim[];
  summary: ClaimSummaryMetrics;
  filters: ClaimFilters;
  onFiltersChange: (filters: Partial<ClaimFilters>) => void;
  onAddClaim: () => void;
  onCreateWorkOrder: (claim: CoverageClaim) => void;
}

export const ClaimsTab: React.FC<ClaimsTabProps> = ({
  claims,
  summary,
  filters,
  onFiltersChange,
  onAddClaim,
  onCreateWorkOrder,
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="title-large font-semibold text-onSurface">Claim Management</h2>
          <p className="body-medium text-onSurfaceVariant">
            Oversee insurance and warranty claim pipelines
          </p>
        </div>
        <Button variant="default" onClick={onAddClaim}>
          Add Claim
        </Button>
      </div>

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

      <Card className="mt-0 p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Policy/Warranty</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead>Work Order</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-onSurfaceVariant py-10">
                  No claims match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredClaims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-onSurface">{claim.claimNumber}</span>
                      <span className="body-small text-onSurfaceVariant">
                        {claim.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{claim.type}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span>{claim.referenceName}</span>
                      <span className="body-small text-onSurfaceVariant">
                        {claim.referenceId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {claim.assets.map((asset) => (
                        <Badge
                          key={asset.id}
                          text={asset.name}
                          variant="grey"
                          className="h-7 px-3 py-1"
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(claim.amount)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={claim.status} />
                  </TableCell>
                  <TableCell>{formatDate(claim.dateFiled)}</TableCell>
                  <TableCell>{claim.workOrderId ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={claim.type !== "Warranty" || Boolean(claim.workOrderId)}
                        onClick={() => onCreateWorkOrder(claim)}
                      >
                        Create Work Order
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
