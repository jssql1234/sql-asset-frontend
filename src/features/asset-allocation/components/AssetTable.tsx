import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge, ProgressBar } from "@/components/ui/components";
import { DataTable } from "@/components/ui/components/Table";
import type { AssetRecord } from "../types";

interface AssetTableProps {
  assets: AssetRecord[];
  onSelectionChange?: (selected: AssetRecord[]) => void;
  selectedAssetIds?: string[];
  onInspectAsset?: (asset: AssetRecord) => void;
}

const statusVariantMap: Record<AssetRecord["status"], string> = {
  Available: "green",
  "In Use": "blue",
  "Fully Booked": "red",
  Maintenance: "yellow",
  Reserved: "primary",
};

const availabilityVariantMap: Record<AssetRecord["availability"], string> = {
  Available: "green",
  Scheduled: "blue",
  "In Maintenance": "yellow",
  Reserved: "primary",
  Unavailable: "grey",
};

const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  onSelectionChange,
  selectedAssetIds,
  onInspectAsset,
}) => {
  const columns = useMemo<ColumnDef<AssetRecord>[]>(
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
        accessorKey: "name",
        header: "Asset Name",
        cell: ({ row }) => {
          const value = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="label-medium text-onSurface">
                {value.name}
              </span>
              <span className="body-small text-onSurfaceVariant">
                {value.code} • {value.category}
              </span>
            </div>
          );
        },
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
      },
      {
        id: "utilization",
        header: "Utilization",
        cell: ({ row }) => {
          const utilization = Math.round(row.original.utilizationRate * 100);
          return (
            <div className="flex flex-col gap-1">
              <ProgressBar value={utilization} max={100} />
              <span className="body-small text-onSurfaceVariant">
                {utilization}%
              </span>
            </div>
          );
        },
        size: 160,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            text={row.original.status}
            variant={statusVariantMap[row.original.status] ?? "primary"}
            dot
          />
        ),
        size: 150,
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <span className="label-medium text-onSurface">
              {row.original.location}
            </span>
            <span className="body-small text-onSurfaceVariant">
              PIC: {row.original.pic}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "availability",
        header: "Availability",
        cell: ({ row }) => (
          <Badge
            text={row.original.availability}
            variant={
              availabilityVariantMap[row.original.availability] ?? "primary"
            }
          />
        ),
        size: 150,
      },
      {
        id: "nextMaintenance",
        header: "Next Maintenance",
        cell: ({ row }) => (
          <div className="flex flex-col">
            {row.original.nextMaintenance ? (
              <span className="body-medium text-onSurface">
                {new Date(row.original.nextMaintenance).toLocaleDateString()}
              </span>
            ) : (
              <span className="body-small text-onSurfaceVariant">
                Not scheduled
              </span>
            )}
            <span className="body-small text-onSurfaceVariant">
              Updated {new Date(row.original.updatedAt).toLocaleDateString()}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Details",
        cell: ({ row }) => (
          <button
            type="button"
            className="label-medium text-primary hover:underline"
            onClick={() => onInspectAsset?.(row.original)}
          >
            Inspect
          </button>
        ),
        enableSorting: false,
        enableColumnFilter: false,
        size: 120,
      },
    ],
    [onInspectAsset]
  );

  const controlledRowSelection = useMemo(() => {
    if (!selectedAssetIds || selectedAssetIds.length === 0) return undefined;
    return assets.reduce<Record<string, boolean>>((acc, asset, index) => {
      if (selectedAssetIds.includes(asset.id)) {
        acc[index.toString()] = true;
      }
      return acc;
    }, {});
  }, [assets, selectedAssetIds]);

  return (
    <div className="flex h-full flex-col">
      <DataTable<AssetRecord, unknown>
        columns={columns}
        data={assets}
        showPagination
        showCheckbox
        enableRowClickSelection
        onRowSelectionChange={(rows) => onSelectionChange?.(rows)}
        rowSelection={controlledRowSelection}
      />
    </div>
  );
};

export default AssetTable;
