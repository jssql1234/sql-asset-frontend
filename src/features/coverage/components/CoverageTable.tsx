import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/components";
import { DataTableExtended, type RowAction } from "@/components/DataTableExtended";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type { CoverageClaim, CoverageInsurance, CoverageWarranty } from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

interface InsurancesVariantProps {
  variant: "insurances";
  policies: CoverageInsurance[];
  onViewInsurance: (insurance: CoverageInsurance) => void;
  onEditInsurance: (insurance: CoverageInsurance) => void;
  onDeleteInsurance: (insurance: CoverageInsurance) => void;
}

interface WarrantiesVariantProps {
  variant: "warranties";
  warranties: CoverageWarranty[];
  onViewWarranty: (warranty: CoverageWarranty) => void;
  onEditWarranty: (warranty: CoverageWarranty) => void;
  onDeleteWarranty: (warranty: CoverageWarranty) => void;
}

interface ClaimsVariantProps {
  variant: "claims";
  claims: CoverageClaim[];
  onViewClaim: (claim: CoverageClaim) => void;
  onEditClaim: (claim: CoverageClaim) => void;
  onDeleteClaim: (claim: CoverageClaim) => void;
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
}: InsurancesVariantProps) => {
  const columns = useMemo<ColumnDef<CoverageInsurance>[]>(
    () => [
      {
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
        accessorKey: "annualPremium",
        header: "Annual Premium",
        enableColumnFilter: false,
        cell: ({ row }) => formatCurrency(row.original.annualPremium),
        meta: {
          align: "right",
        },
      },
      {
        accessorKey: "totalClaimed",
        header: "Total Claimed",
        enableColumnFilter: false,
        cell: ({ row }) => formatCurrency(row.original.totalClaimed),
        meta: {
          align: "right",
        },
      },
      {
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

  return (
    <DataTableExtended<CoverageInsurance, unknown>
      columns={columns}
      data={policies}
      showPagination
      rowActions={rowActions}
    />
  );
};

const WarrantiesVariantTable = ({ warranties, onViewWarranty, onEditWarranty, onDeleteWarranty }: WarrantiesVariantProps) => {
  const columns = useMemo<ColumnDef<CoverageWarranty>[]>(
    () => [
      {
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
        accessorKey: "provider",
        header: "Provider",
        enableColumnFilter: false,
      },
      {
        accessorKey: "coverage",
        header: "Coverage",
        enableColumnFilter: true,
        filterFn: "multiSelect",
        enableSorting: true,
      },
      {
        accessorKey: "expiryDate",
        header: "Expiry Date",
        enableColumnFilter: false,
        cell: ({ row }) => formatDate(row.original.expiryDate),
      },
      {
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

  return (
    <DataTableExtended<CoverageWarranty, unknown>
      columns={columns}
      data={warranties}
      showPagination
      rowActions={rowActions}
    />
  );
};

const ClaimsVariantTable = ({
  claims,
  onViewClaim,
  onEditClaim,
  onDeleteClaim,
}: ClaimsVariantProps) => {
  const columns = useMemo<ColumnDef<CoverageClaim>[]>(
    () => [
      {
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
        accessorKey: "assets",
        header: "Assets",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.assets.map((asset) => (
              <Badge
                key={asset.id}
                text={asset.name}
                variant="grey"
                className="h-7 px-3 py-1"
              />
            ))}
          </div>
        ),
      },
      {
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
        accessorKey: "status",
        header: "Status",
        enableColumnFilter: true,
        filterFn: "multiSelect",
        enableSorting: true,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "dateFiled",
        header: "Date Filed",
        enableColumnFilter: false,
        cell: ({ row }) => formatDate(row.original.dateFiled),
      },
      {
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

  return (
    <DataTableExtended<CoverageClaim, unknown>
      columns={columns}
      data={claims}
      showPagination
      rowActions={rowActions}
    />
  );
};

const CoverageTable = (props: CoverageTableProps) => {
  if (props.variant === "insurances") {
    const { policies, onViewInsurance, onEditInsurance, onDeleteInsurance } = props;
    return <InsurancesVariantTable variant="insurances" policies={policies} onViewInsurance={onViewInsurance} onEditInsurance={onEditInsurance} onDeleteInsurance={onDeleteInsurance} />;
  }

  if (props.variant === "warranties") {
    const { warranties, onViewWarranty, onEditWarranty, onDeleteWarranty } = props;
    return <WarrantiesVariantTable variant="warranties" warranties={warranties} onViewWarranty={onViewWarranty} onEditWarranty={onEditWarranty} onDeleteWarranty={onDeleteWarranty} />;
  }

  const { claims, onViewClaim, onEditClaim, onDeleteClaim } = props;
  return (
    <ClaimsVariantTable variant="claims" claims={claims} onViewClaim={onViewClaim} onEditClaim={onEditClaim} onDeleteClaim={onDeleteClaim}/>
  );
};

export type { InsurancesVariantProps, WarrantiesVariantProps, ClaimsVariantProps };
export default CoverageTable;
