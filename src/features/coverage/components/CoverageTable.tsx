import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type { CoverageClaim, CoverageInsurance, CoverageWarranty } from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

interface InsurancesVariantProps {
  variant: "insurances";
  policies: CoverageInsurance[];
  onViewInsurance: (insurance: CoverageInsurance) => void;
}

interface WarrantiesVariantProps {
  variant: "warranties";
  warranties: CoverageWarranty[];
  onViewWarranty: (warranty: CoverageWarranty) => void;
}

interface ClaimsVariantProps {
  variant: "claims";
  claims: CoverageClaim[];
  onViewClaim: (claim: CoverageClaim) => void;
}

type CoverageTableProps =
  | InsurancesVariantProps
  | WarrantiesVariantProps
  | ClaimsVariantProps;

const InsurancesVariantTable = ({
  policies,
  onViewInsurance,
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

  return (
    <DataTableExtended<CoverageInsurance, unknown>
      columns={columns}
      data={policies}
      showPagination
      onRowDoubleClick={onViewInsurance}
    />
  );
};

const WarrantiesVariantTable = ({ warranties, onViewWarranty }: WarrantiesVariantProps) => {
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

  return (
    <DataTableExtended<CoverageWarranty, unknown>
      columns={columns}
      data={warranties}
      showPagination
      onRowDoubleClick={onViewWarranty}
    />
  );
};

const ClaimsVariantTable = ({
  claims,
  onViewClaim,
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

  return (
    <DataTableExtended<CoverageClaim, unknown>
      columns={columns}
      data={claims}
      showPagination
      onRowDoubleClick={onViewClaim}
    />
  );
};

const CoverageTable = (props: CoverageTableProps) => {
  if (props.variant === "insurances") {
    const { policies, onViewInsurance } = props;
    return <InsurancesVariantTable variant="insurances" policies={policies} onViewInsurance={onViewInsurance} />;
  }

  if (props.variant === "warranties") {
    const { warranties, onViewWarranty } = props;
    return <WarrantiesVariantTable variant="warranties" warranties={warranties} onViewWarranty={onViewWarranty} />;
  }

  const { claims, onViewClaim } = props;
  return (
    <ClaimsVariantTable
      variant="claims"
      claims={claims}
      onViewClaim={onViewClaim}
    />
  );
};

export type { InsurancesVariantProps, WarrantiesVariantProps, ClaimsVariantProps };
export default CoverageTable;
