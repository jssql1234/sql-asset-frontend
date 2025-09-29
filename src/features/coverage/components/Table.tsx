import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge, Button } from "@/components/ui/components";
import { DataTable } from "@/components/ui/components/Table";
import { StatusBadge } from "@/features/coverage/components/StatusBadge";
import type {
  CoverageClaim,
  CoveragePolicy,
  CoverageWarranty,
} from "@/features/coverage/types";
import { formatCurrency, formatDate } from "@/features/coverage/utils/formatters";

type PoliciesVariantProps = {
  variant: "policies";
  policies: CoveragePolicy[];
  onViewPolicy: (policy: CoveragePolicy) => void;
};

type WarrantiesVariantProps = {
  variant: "warranties";
  warranties: CoverageWarranty[];
};

type ClaimsVariantProps = {
  variant: "claims";
  claims: CoverageClaim[];
  onCreateWorkOrder: (claim: CoverageClaim) => void;
};

type CoverageTableProps =
  | PoliciesVariantProps
  | WarrantiesVariantProps
  | ClaimsVariantProps;

const PoliciesVariantTable = ({
  policies,
  onViewPolicy,
}: PoliciesVariantProps) => {
  const columns = useMemo<ColumnDef<CoveragePolicy>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Policy",
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
        cell: ({ row }) => formatCurrency(row.original.annualPremium),
        meta: {
          align: "right",
        },
      },
      {
        accessorKey: "totalClaimed",
        header: "Total Claimed",
        cell: ({ row }) => formatCurrency(row.original.totalClaimed),
        meta: {
          align: "right",
        },
      },
      {
        accessorKey: "expiryDate",
        header: "Expiry Date",
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
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "assetsCovered",
        header: "Assets",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.assetsCovered.map((asset) => (
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
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onViewPolicy(row.original)}>
              View
            </Button>
            <Button variant="secondary" size="sm">
              Edit
            </Button>
          </div>
        ),
        meta: {
          align: "right",
        },
      },
    ],
    [onViewPolicy]
  );

  return (
    <DataTable<CoveragePolicy, unknown>
      columns={columns}
      data={policies}
      showPagination
    />
  );
};

const WarrantiesVariantTable = ({ warranties }: WarrantiesVariantProps) => {
  const columns = useMemo<ColumnDef<CoverageWarranty>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Warranty",
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
      },
      {
        accessorKey: "coverage",
        header: "Coverage",
      },
      {
        accessorKey: "expiryDate",
        header: "Expiry Date",
        cell: ({ row }) => formatDate(row.original.expiryDate),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "assetsCovered",
        header: "Assets",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.assetsCovered.map((asset) => (
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
    ],
    []
  );

  return (
    <DataTable<CoverageWarranty, unknown>
      columns={columns}
      data={warranties}
      showPagination
    />
  );
};

const ClaimsVariantTable = ({
  claims,
  onCreateWorkOrder,
}: ClaimsVariantProps) => {
  const columns = useMemo<ColumnDef<CoverageClaim>[]>(
    () => [
      {
        accessorKey: "claimNumber",
        header: "Claim",
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
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "dateFiled",
        header: "Date Filed",
        cell: ({ row }) => formatDate(row.original.dateFiled),
      },
      {
        accessorKey: "workOrderId",
        header: "Work Order",
        cell: ({ row }) => row.original.workOrderId ?? "—",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm">
              View
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={
                row.original.type !== "Warranty" || Boolean(row.original.workOrderId)
              }
              onClick={() => onCreateWorkOrder(row.original)}
            >
              Create Work Order
            </Button>
          </div>
        ),
        meta: {
          align: "right",
        },
      },
    ],
    [onCreateWorkOrder]
  );

  return (
    <DataTable<CoverageClaim, unknown>
      columns={columns}
      data={claims}
      showPagination
    />
  );
};

const CoverageTable = (props: CoverageTableProps) => {
  if (props.variant === "policies") {
    const { policies, onViewPolicy } = props;
    return <PoliciesVariantTable variant="policies" policies={policies} onViewPolicy={onViewPolicy} />;
  }

  if (props.variant === "warranties") {
    const { warranties } = props;
    return <WarrantiesVariantTable variant="warranties" warranties={warranties} />;
  }

  const { claims, onCreateWorkOrder } = props;
  return (
    <ClaimsVariantTable
      variant="claims"
      claims={claims}
      onCreateWorkOrder={onCreateWorkOrder}
    />
  );
};

export type { PoliciesVariantProps, WarrantiesVariantProps, ClaimsVariantProps };
export default CoverageTable;
