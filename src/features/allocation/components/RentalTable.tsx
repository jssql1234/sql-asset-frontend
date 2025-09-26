import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge, Button } from "@/components/ui/components";
import { DataTable } from "@/components/ui/components/Table";
import type { RentalRecord } from "../types";

interface RentalTableProps {
  rentals: RentalRecord[];
}

const statusToneMap: Record<RentalRecord["status"], string> = {
  Scheduled: "primary",
  Active: "green",
  Completed: "grey",
  Overdue: "error",
  Cancelled: "secondary",
};

const RentalTable: React.FC<RentalTableProps> = ({ rentals }) => {
  const columns = useMemo<ColumnDef<RentalRecord>[]>(
    () => [
      {
        id: "sequence",
        header: "No.",
        cell: ({ row }) => (
          <span className="body-small text-onSurfaceVariant">
            {Number(row.id) + 1}
          </span>
        ),
        size: 64,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "assetName",
        header: "Asset",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="label-medium text-onSurface">
              {row.original.assetName}
            </span>
            <span className="body-small text-onSurfaceVariant">
              Rental ID: {row.original.id}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="label-medium text-onSurface">
              {row.original.customerName}
            </span>
            <span className="body-small text-onSurfaceVariant">
              {row.original.contactEmail ?? "No email"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="body-medium text-onSurfaceVariant">
            {row.original.location}
          </span>
        ),
        size: 150,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            text={row.original.status}
            variant={statusToneMap[row.original.status] ?? "primary"}
            dot
          />
        ),
        size: 130,
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
      },
      {
        id: "actions",
        header: "Actions",
        cell: () => (
          <Button variant="link" size="sm">
            View Details
          </Button>
        ),
        enableSorting: false,
        enableColumnFilter: false,
        size: 120,
      },
    ],
    []
  );

  return (
    <div className="flex h-full flex-col">
      <DataTable<RentalRecord, unknown>
        columns={columns}
        data={rentals}
        showPagination
      />
    </div>
  );
};

const formatDate = (date?: string) => {
  if (!date) return "TBD";
  return new Date(date).toLocaleDateString();
};

export default RentalTable;
