import { useMemo, useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/components";
import { DataTableExtended, type RowAction } from "@/components/DataTableExtended";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type { CoverageClaim, CoverageInsurance, CoverageWarranty } from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";
import TableColumnVisibility from "@/components/ui/components/Table/TableColumnVisibility";
import Search from "@/components/Search";

interface InsurancesVariantProps {
  variant: "insurances";
  policies: CoverageInsurance[];
  onViewInsurance: (insurance: CoverageInsurance) => void;
  onEditInsurance: (insurance: CoverageInsurance) => void;
  onDeleteInsurance: (insurance: CoverageInsurance) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

interface WarrantiesVariantProps {
  variant: "warranties";
  warranties: CoverageWarranty[];
  onViewWarranty: (warranty: CoverageWarranty) => void;
  onEditWarranty: (warranty: CoverageWarranty) => void;
  onDeleteWarranty: (warranty: CoverageWarranty) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

interface ClaimsVariantProps {
  variant: "claims";
  claims: CoverageClaim[];
  onViewClaim: (claim: CoverageClaim) => void;
  onEditClaim: (claim: CoverageClaim) => void;
  onDeleteClaim: (claim: CoverageClaim) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

type CoverageTableProps =
  | InsurancesVariantProps
  | WarrantiesVariantProps
  | ClaimsVariantProps;

const InsurancesVariantTable = ({
  policies,
  onViewInsurance,
  onEditInsurance,
  onDeleteInsurance,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}: InsurancesVariantProps) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;

  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return policies;
    
    const query = searchQuery.toLowerCase();
    return policies.filter((policy) => {
      return (
        policy.name.toLowerCase().includes(query) ||
        policy.provider.toLowerCase().includes(query) ||
        policy.policyNumber.toLowerCase().includes(query) ||
        policy.status.toLowerCase().includes(query) ||
        policy.assetsCovered.some((asset) =>
          asset.id.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
        )
      );
    });
  }, [policies, searchQuery]);
  const columns = useMemo<ColumnDef<CoverageInsurance>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Policy",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const policy = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-onSurface">{policy.name}</span>
              <span className="body-small text-onSurfaceVariant">
                {policy.provider} • {policy.policyNumber}
              </span>
            </div>
          );
        },
      },
      {
        id: "remainingCoverage",
        accessorKey: "remainingCoverage",
        header: "Available Coverage",
        enableColumnFilter: false,
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.remainingCoverage)}
          </span>
        ),
        meta: {
          align: "right",
        },
      },
      {
        id: "annualPremium",
        accessorKey: "annualPremium",
        header: "Annual Premium",
        enableColumnFilter: false,
        cell: ({ row }) => formatCurrency(row.original.annualPremium),
        meta: {
          align: "right",
        },
      },
      {
        id: "totalClaimed",
        accessorKey: "totalClaimed",
        header: "Total Claimed",
        enableColumnFilter: false,
        cell: ({ row }) => formatCurrency(row.original.totalClaimed),
        meta: {
          align: "right",
        },
      },
      {
        id: "expiryDate",
        accessorKey: "expiryDate",
        header: "Expiry Date",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const policy = row.original;
          return (
            <div className="flex flex-col">
              <span>{formatDate(policy.expiryDate)}</span>
              <span className="body-small text-onSurfaceVariant">
                {policy.status === "Expiring Soon" && "Renew within 30 days"}
              </span>
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        enableColumnFilter: true,
        filterFn: "multiSelect",
        enableSorting: true,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  );

  const rowActions: RowAction<CoverageInsurance>[] = useMemo(
    () => [
      {
        type: "view",
        onClick: onViewInsurance,
      },
      {
        type: "edit",
        onClick: onEditInsurance,
      },
      {
        type: "delete",
        onClick: onDeleteInsurance,
      },
    ],
    [onViewInsurance, onEditInsurance, onDeleteInsurance]
  );

  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<CoverageInsurance>[]>([]);

  useEffect(() => {
    if (visibleColumns.length === 0 && columns.length > 0) {
      setVisibleColumns(columns);
    }
  }, [columns, visibleColumns.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <TableColumnVisibility columns={columns} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns}/>
        <div className="flex-shrink-0 w-80">
          <Search searchValue={searchQuery} onSearch={setSearchQuery} searchPlaceholder="Search policies..." live={true} />
        </div>
      </div>
      <DataTableExtended<CoverageInsurance, unknown>
        columns={visibleColumns}
        data={filteredPolicies}
        showPagination
        rowActions={rowActions}
      />
    </div>
  );
};

const WarrantiesVariantTable = ({ warranties, onViewWarranty, onEditWarranty, onDeleteWarranty, searchQuery: externalSearchQuery, onSearchQueryChange }: WarrantiesVariantProps) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;

  const filteredWarranties = useMemo(() => {
    if (!searchQuery.trim()) return warranties;
    
    const query = searchQuery.toLowerCase();
    return warranties.filter((warranty) => {
      return (
        warranty.name.toLowerCase().includes(query) ||
        warranty.provider.toLowerCase().includes(query) ||
        warranty.warrantyNumber.toLowerCase().includes(query) ||
        warranty.status.toLowerCase().includes(query) ||
        warranty.coverage.toLowerCase().includes(query)
      );
    });
  }, [warranties, searchQuery]);
  const columns = useMemo<ColumnDef<CoverageWarranty>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Warranty",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const warranty = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-onSurface">{warranty.name}</span>
              <span className="body-small text-onSurfaceVariant">
                {warranty.warrantyNumber}
              </span>
            </div>
          );
        },
      },
      {
        id: "provider",
        accessorKey: "provider",
        header: "Provider",
        enableColumnFilter: false,
      },
      {
        id: "coverage",
        accessorKey: "coverage",
        header: "Coverage",
        enableColumnFilter: true,
        filterFn: "multiSelect",
        enableSorting: true,
      },
      {
        id: "expiryDate",
        accessorKey: "expiryDate",
        header: "Expiry Date",
        enableColumnFilter: false,
        cell: ({ row }) => formatDate(row.original.expiryDate),
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        enableColumnFilter: true,
        filterFn: "multiSelect",
        enableSorting: true,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  );

  const rowActions: RowAction<CoverageWarranty>[] = useMemo(
    () => [
      {
        type: "view",
        onClick: onViewWarranty,
      },
      {
        type: "edit",
        onClick: onEditWarranty,
      },
      {
        type: "delete",
        onClick: onDeleteWarranty,
      },
    ],
    [onViewWarranty, onEditWarranty, onDeleteWarranty]
  );

  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<CoverageWarranty>[]>([]);

  useEffect(() => {
    if (visibleColumns.length === 0 && columns.length > 0) {
      setVisibleColumns(columns);
    }
  }, [columns, visibleColumns.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <TableColumnVisibility columns={columns} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns}/>
        <div className="flex-shrink-0 w-80">
          <Search searchValue={searchQuery} onSearch={setSearchQuery} searchPlaceholder="Search warranties..." live={true} />
        </div>
      </div>
      <DataTableExtended<CoverageWarranty, unknown>
        columns={visibleColumns}
        data={filteredWarranties}
        showPagination
        rowActions={rowActions}
      />
    </div>
  );
};

const ClaimsVariantTable = ({
  claims,
  onViewClaim,
  onEditClaim,
  onDeleteClaim,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}: ClaimsVariantProps) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;

  const filteredClaims = useMemo(() => {
    if (!searchQuery.trim()) return claims;
    
    const query = searchQuery.toLowerCase();
    return claims.filter((claim) => {
      return (
        claim.claimNumber.toLowerCase().includes(query) ||
        (claim.description?.toLowerCase().includes(query) ?? false) ||
        claim.type.toLowerCase().includes(query) ||
        claim.referenceName.toLowerCase().includes(query) ||
        claim.referenceId.toLowerCase().includes(query) ||
        claim.status.toLowerCase().includes(query) ||
        claim.assets.some((asset) =>
          asset.id.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query)
        )
      );
    });
  }, [claims, searchQuery]);
  const columns = useMemo<ColumnDef<CoverageClaim>[]>(
    () => [
      {
        id: "claimNumber",
        accessorKey: "claimNumber",
        header: "Claim",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const claim = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-onSurface">{claim.claimNumber}</span>
              <span className="body-small text-onSurfaceVariant">
                {claim.description}
              </span>
            </div>
          );
        },
      },
      {
        id: "type",
        accessorKey: "type",
        header: "Type",
        enableColumnFilter: true,
        filterFn: "multiSelect",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge
            text={row.original.type}
            variant={row.original.type === "Insurance" ? "blue" : "green"}
          />
        ),
      },
      {
        id: "referenceName",
        accessorKey: "referenceName",
        header: "Policy/Warranty",
        enableColumnFilter: true,
        filterFn: "multiSelect",
        enableSorting: true,
        cell: ({ row }) => {
          const claim = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-onSurface">{claim.referenceName}</span>
              <span className="body-small text-onSurfaceVariant">{claim.referenceId}</span>
            </div>
          );
        },
      },
      {
        id: "assets",
        accessorKey: "assets",
        header: "Assets",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.assets.map((asset) => (
              <Badge
                key={asset.id}
                text={`${asset.name} (${asset.id})`}
                variant="grey"
                className="h-7 px-3 py-1"
              />
            ))}
          </div>
        ),
      },
      {
        id: "amount",
        accessorKey: "amount",
        header: "Amount",
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {formatCurrency(row.original.amount)}
          </div>
        ),
        meta: {
          align: "right",
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        enableColumnFilter: true,
        filterFn: "multiSelect",
        enableSorting: true,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "dateFiled",
        accessorKey: "dateFiled",
        header: "Date Filed",
        enableColumnFilter: false,
        cell: ({ row }) => formatDate(row.original.dateFiled),
      },
      {
        id: "workOrderId",
        accessorKey: "workOrderId",
        header: "Work Order",
        enableColumnFilter: false,
        cell: ({ row }) => row.original.workOrderId ?? "—",
      },
    ],
    []
  );

  const rowActions: RowAction<CoverageClaim>[] = useMemo(
    () => [
      {
        type: "view",
        onClick: onViewClaim,
      },
      {
        type: "edit",
        onClick: onEditClaim,
      },
      {
        type: "delete",
        onClick: onDeleteClaim,
      },
    ],
    [onViewClaim, onEditClaim, onDeleteClaim]
  );

  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<CoverageClaim>[]>([]);

  useEffect(() => {
    if (visibleColumns.length === 0 && columns.length > 0) {
      setVisibleColumns(columns);
    }
  }, [columns, visibleColumns.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <TableColumnVisibility columns={columns} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns}/>
        <div className="flex-shrink-0 w-80">
          <Search searchValue={searchQuery} onSearch={setSearchQuery} searchPlaceholder="Search claims..." live={true} />
        </div>
      </div>
      <DataTableExtended<CoverageClaim, unknown>
        columns={visibleColumns}
        data={filteredClaims}
        showPagination
        rowActions={rowActions}
      />
    </div>
  );
};

const CoverageTable = (props: CoverageTableProps) => {
  if (props.variant === "insurances") {
    const { policies, onViewInsurance, onEditInsurance, onDeleteInsurance, searchQuery, onSearchQueryChange } = props;
    return <InsurancesVariantTable variant="insurances" policies={policies} onViewInsurance={onViewInsurance} onEditInsurance={onEditInsurance} onDeleteInsurance={onDeleteInsurance} searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} />;
  }

  if (props.variant === "warranties") {
    const { warranties, onViewWarranty, onEditWarranty, onDeleteWarranty, searchQuery, onSearchQueryChange } = props;
    return <WarrantiesVariantTable variant="warranties" warranties={warranties} onViewWarranty={onViewWarranty} onEditWarranty={onEditWarranty} onDeleteWarranty={onDeleteWarranty} searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} />;
  }

  const { claims, onViewClaim, onEditClaim, onDeleteClaim, searchQuery, onSearchQueryChange } = props;
  return (
    <ClaimsVariantTable variant="claims" claims={claims} onViewClaim={onViewClaim} onEditClaim={onEditClaim} onDeleteClaim={onDeleteClaim} searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange}/>
  );
};

export type { InsurancesVariantProps, WarrantiesVariantProps, ClaimsVariantProps };
export default CoverageTable;
