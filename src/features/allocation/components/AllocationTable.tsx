import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import type { AssetRecord, RentalRecord } from "../types";

const allocationStatusVariantMap: Record<AssetRecord["status"], string> = {
  Available: "green",
  "In Use": "blue",
  "Fully Booked": "red",
  Maintenance: "yellow",
  Reserved: "primary",
};

const rentalStatusToneMap: Record<RentalRecord["status"], string> = {
  Scheduled: "primary",
  Active: "green",
  Completed: "grey",
  Overdue: "error",
  Cancelled: "secondary",
};

interface AllocationVariantProps {
  variant: "allocation";
  assets: AssetRecord[];
}

interface RentalVariantProps {
  variant: "rental";
  rentals: RentalRecord[];
}

type TableProps = AllocationVariantProps | RentalVariantProps;

const AllocationVariantTable: React.FC<AllocationVariantProps> = ({
  assets,
}) => {
  const columns = useMemo<ColumnDef<AssetRecord>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Asset Name",
        cell: ({ row }) => {
          const value = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="label-medium text-onSurface">{value.name}</span>
              <span className="body-small text-onSurfaceVariant">
                {value.code} • {value.category}
              </span>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => (
          <div className="text-center label-medium text-onSurface">
            {row.original.total}
          </div>
        ),
        size: 96,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "allocated",
        header: "Allocated",
        cell: ({ row }) => (
          <div className="text-center label-medium text-onSurface">
            {row.original.allocated}
          </div>
        ),
        size: 112,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "remaining",
        header: "Remaining",
        cell: ({ row }) => (
          <div className="text-center label-medium text-onSurface">
            {row.original.remaining}
          </div>
        ),
        size: 116,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            text={row.original.status}
            variant={allocationStatusVariantMap[row.original.status]}
            dot
          />
        ),
        size: 150,
        filterFn: "multiSelect",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="label-medium text-onSurface">{row.original.location}</span>
            <span className="body-small text-onSurfaceVariant">
              PIC: {row.original.pic}
            </span>
          </div>
        ),
        filterFn: "multiSelect",
        enableColumnFilter: true,
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <div className="flex h-full flex-col">
      <DataTableExtended<AssetRecord, unknown>
        columns={columns}
        data={assets}
        showPagination
      />
    </div>
  );
};

const RentalVariantTable: React.FC<RentalVariantProps> = ({ rentals }) => {
  const columns = useMemo<ColumnDef<RentalRecord>[]>(
    () => [
      {
        accessorKey: "assetName",
        header: "Asset",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="label-medium text-onSurface">{row.original.assetName}</span>
            <span className="body-small text-onSurfaceVariant">
              Rental ID: {row.original.id}
            </span>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="label-medium text-onSurface">{row.original.customerName}</span>
            <span className="body-small text-onSurfaceVariant">
              {row.original.contactEmail ?? "No email"}
            </span>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="body-medium text-onSurfaceVariant">{row.original.location}</span>
        ),
        size: 150,
        filterFn: "multiSelect",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            text={row.original.status}
            variant={rentalStatusToneMap[row.original.status]}
            dot
          />
        ),
        size: 130,
        filterFn: "multiSelect",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        id: "window",
        header: "Window",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="label-medium text-onSurface">
              {formatDate(row.original.startDate)}
            </span>
            <span className="body-small text-onSurfaceVariant">
              to {formatDate(row.original.endDate)}
            </span>
          </div>
        ),
        size: 180,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "quantity",
        header: "Qty",
        cell: ({ row }) => (
          <div className="text-center label-medium text-onSurface">
            {row.original.quantity}
          </div>
        ),
        size: 80,
        enableSorting: true,
        enableColumnFilter: false,
      },
    ],
    []
  );

  return (
    <div className="flex h-full flex-col">
      <DataTableExtended<RentalRecord, unknown>
        columns={columns}
        data={rentals}
        showPagination
      />
    </div>
  );
};

const Table: React.FC<TableProps> = (props) => {
  if (props.variant === "allocation") {
    const { assets } = props;
    return (
      <AllocationVariantTable
        variant="allocation"
        assets={assets}
      />
    );
  }

  const { rentals } = props;
  return <RentalVariantTable variant="rental" rentals={rentals} />;
};

const formatDate = (date?: string) => {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString();
};

export type { AllocationVariantProps, RentalVariantProps };
export default Table;
