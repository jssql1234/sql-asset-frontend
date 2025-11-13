import { useEffect, useMemo, useState } from "react";
import type { ColumnDef, ExpandedState, GroupingState } from "@tanstack/react-table";
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

type GroupableAssetRecord = AssetRecord & { assetGroup: string };

const AllocationVariantTable: React.FC<AllocationVariantProps> = ({
  assets,
}) => {
  const [grouping, setGrouping] = useState<GroupingState>(["assetGroup"]);
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const data = useMemo<GroupableAssetRecord[]>(
    () =>
      assets.map((asset) => ({
        ...asset,
        assetGroup: asset.category,
      })),
    [assets]
  );

  useEffect(() => {
    setExpanded(true);
  }, [assets]);

  const columns = useMemo<ColumnDef<GroupableAssetRecord>[]>(
    () => [
      {
        id: "assetGroup",
        accessorKey: "assetGroup",
        header: "Asset Group / Asset",
        cell: ({ row, getValue }) => {
          if (row.getIsGrouped()) {
            const groupName = getValue<string>();
            const assetCount = row.subRows.length;

            return (
              <div className="flex items-center gap-3 py-1">
                {row.getCanExpand() && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      row.toggleExpanded();
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-outlineVariant text-body-medium text-onSurface"
                    aria-label={row.getIsExpanded() ? "Collapse asset group" : "Expand asset group"}
                  >
                    {row.getIsExpanded() ? "-" : "+"}
                  </button>
                )}
                <div className="flex flex-col">
                  <span className="label-medium text-onSurface">{groupName}</span>
                  <span className="body-small text-onSurfaceVariant">
                    {assetCount} asset{assetCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            );
          }

          const original = row.original;

          return (
            <div className="flex flex-col gap-1 pl-9">
              <span className="label-medium text-onSurface">{original.name}</span>
              <span className="body-small text-onSurfaceVariant">
                {original.code}
              </span>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: "multiSelect",
      },
      {
        accessorKey: "total",
        header: "Total",
        aggregationFn: "sum",
        cell: ({ cell, row }) => {
          if (cell.getIsAggregated()) {
            const rawValue = cell.getValue<number>();
            const value = typeof rawValue === "number" ? rawValue : 0;
            return (
              <div className="text-center label-medium text-onSurface">
                {value}
              </div>
            );
          }

          if (row.depth > 0) {
            return null;
          }

          return (
            <div className="text-center label-medium text-onSurface">
              {row.original.total}
            </div>
          );
        },
        size: 96,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "allocated",
        header: "Allocated",
        aggregationFn: "sum",
        cell: ({ cell, row }) => {
          if (cell.getIsAggregated()) {
            const rawValue = cell.getValue<number>();
            const value = typeof rawValue === "number" ? rawValue : 0;
            return (
              <div className="text-center label-medium text-onSurface">
                {value}
              </div>
            );
          }

          if (row.depth > 0) {
            return null;
          }

          return (
            <div className="text-center label-medium text-onSurface">
              {row.original.allocated}
            </div>
          );
        },
        size: 112,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "remaining",
        header: "Remaining",
        aggregationFn: "sum",
        cell: ({ cell, row }) => {
          if (cell.getIsAggregated()) {
            const rawValue = cell.getValue<number>();
            const value = typeof rawValue === "number" ? rawValue : 0;
            return (
              <div className="text-center label-medium text-onSurface">
                {value}
              </div>
            );
          }

          if (row.depth > 0) {
            return null;
          }

          return (
            <div className="text-center label-medium text-onSurface">
              {row.original.remaining}
            </div>
          );
        },
        size: 116,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        aggregationFn: () => null,
        cell: ({ row }) => {
          if (row.depth === 0) {
            return null;
          }

          return (
            <Badge
              text={row.original.status}
              variant={allocationStatusVariantMap[row.original.status]}
              dot
            />
          );
        },
        size: 150,
        filterFn: "multiSelect",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        accessorKey: "location",
        header: "Location",
        aggregationFn: () => null,
        cell: ({ row }) => {
          if (row.depth === 0) {
            return null;
          }

          return (
            <div className="flex flex-col gap-1">
              <span className="label-medium text-onSurface">{row.original.location}</span>
              <span className="body-small text-onSurfaceVariant">
                PIC: {row.original.pic}
              </span>
            </div>
          );
        },
        filterFn: "multiSelect",
        enableColumnFilter: true,
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <div className="flex h-full flex-col">
      <DataTableExtended<GroupableAssetRecord, unknown>
        columns={columns}
        data={data}
        showPagination
        enableGrouping
        grouping={grouping}
        onGroupingChange={setGrouping}
        expanded={expanded}
        onExpandedChange={setExpanded}
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
