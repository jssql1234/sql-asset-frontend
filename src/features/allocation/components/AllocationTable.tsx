import { useEffect, useMemo, useState } from "react";
import type { ColumnDef, ExpandedState, GroupingState } from "@tanstack/react-table";
import { Badge } from "@/components/ui/components";
import TableColumnVisibility from "@/components/ui/components/Table/TableColumnVisibility";
import { DataTableExtended } from "@/components/DataTableExtended";
import Search from "@/components/Search";
import { formatDate } from "../utils/formatters";
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
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  searchPlaceholder?: string;
}

interface RentalVariantProps {
  variant: "rental";
  rentals: RentalRecord[];
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  searchPlaceholder?: string;
}

type TableProps = AllocationVariantProps | RentalVariantProps;

type GroupableAssetRecord = AssetRecord & { assetGroup: string };

const AllocationVariantTable: React.FC<AllocationVariantProps> = ({
  assets,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  searchPlaceholder = "Search assets...",
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;

  const [grouping, setGrouping] = useState<GroupingState>(["assetGroup"]);
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<GroupableAssetRecord>[]>([]);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return assets;
    }

    return assets.filter((asset) => {
      return (
        asset.name.toLowerCase().includes(normalizedQuery) ||
        asset.code.toLowerCase().includes(normalizedQuery) ||
        asset.status.toLowerCase().includes(normalizedQuery) ||
        asset.location.toLowerCase().includes(normalizedQuery) ||
        asset.category.toLowerCase().includes(normalizedQuery) ||
        asset.user.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [assets, searchQuery]);

  const data = useMemo<GroupableAssetRecord[]>(
    () =>
      filteredAssets.map((asset) => ({
        ...asset,
        assetGroup: asset.category,
      })),
    [filteredAssets]
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
                  <span className="body-small text-onSurfaceVariant">{assetCount} asset{assetCount === 1 ? "" : "s"}</span>
                </div>
              </div>
            );
          }

          const original = row.original;

          return (
            <div className="flex flex-col gap-1 pl-9">
              <span className="label-medium text-onSurface">{original.name}</span>
              <span className="body-small text-onSurfaceVariant">{original.code} • {original.assetGroup}</span>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: "multiSelect",
      },
      {
        id: "total",
        accessorKey: "total",
        header: "Total",
        aggregationFn: "sum",
        cell: ({ cell, row }) => {
          if (cell.getIsAggregated()) {
            const rawValue = cell.getValue<number>();
            const value = typeof rawValue === "number" ? rawValue : 0;
            return (
              <div className="text-center label-medium text-onSurface">{value}</div>
            );
          }

          if (row.depth > 0) {
            return null;
          }

          return (
            <div className="text-center label-medium text-onSurface">{row.original.total}</div>
          );
        },
        size: 96,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: "allocated",
        accessorKey: "allocated",
        header: "Allocated",
        aggregationFn: "sum",
        cell: ({ cell, row }) => {
          if (cell.getIsAggregated()) {
            const rawValue = cell.getValue<number>();
            const value = typeof rawValue === "number" ? rawValue : 0;
            return (
              <div className="text-center label-medium text-onSurface">{value}</div>
            );
          }

          if (row.depth > 0) {
            return null;
          }

          return (
            <div className="text-center label-medium text-onSurface">{row.original.allocated}</div>
          );
        },
        size: 112,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: "remaining",
        accessorKey: "remaining",
        header: "Remaining",
        aggregationFn: "sum",
        cell: ({ cell, row }) => {
          if (cell.getIsAggregated()) {
            const rawValue = cell.getValue<number>();
            const value = typeof rawValue === "number" ? rawValue : 0;
            return (
              <div className="text-center label-medium text-onSurface">{value}</div>
            );
          }

          if (row.depth > 0) {
            return null;
          }

          return (
            <div className="text-center label-medium text-onSurface">{row.original.remaining}</div>
          );
        },
        size: 116,
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        aggregationFn: () => null,
        cell: ({ row }) => {
          if (row.depth === 0) {
            return null;
          }

          return (
            <Badge text={row.original.status} variant={allocationStatusVariantMap[row.original.status]} dot/>
          );
        },
        size: 150,
        filterFn: "multiSelect",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        id: "location",
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
              <span className="body-small text-onSurfaceVariant">User: {row.original.user}</span>
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

  useEffect(() => {
    if (visibleColumns.length === 0 && columns.length > 0) {
      setVisibleColumns(columns);
    }
  }, [columns, visibleColumns.length]);

  const resolvedColumns = visibleColumns.length > 0 ? visibleColumns : columns;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 mb-4">
        <TableColumnVisibility columns={columns} visibleColumns={resolvedColumns} setVisibleColumns={setVisibleColumns}/>
        <div className="flex-shrink-0 w-80">
          <Search searchValue={searchQuery} onSearch={setSearchQuery} searchPlaceholder={searchPlaceholder} live={true} />
        </div>
      </div>
      <DataTableExtended<GroupableAssetRecord, unknown>
        columns={resolvedColumns}
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

const RentalVariantTable: React.FC<RentalVariantProps> = ({ 
  rentals,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  searchPlaceholder = "Search rentals...",
}) => {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;
  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<RentalRecord>[]>([]);

  const filteredRentals = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return rentals;
    }

    return rentals.filter((rental) => {
      return (
        rental.assetName.toLowerCase().includes(normalizedQuery) ||
        rental.customerName.toLowerCase().includes(normalizedQuery) ||
        rental.status.toLowerCase().includes(normalizedQuery) ||
        rental.location.toLowerCase().includes(normalizedQuery) ||
        (rental.contactEmail?.toLowerCase().includes(normalizedQuery) ?? false) ||
        (rental.contactPhone?.toLowerCase().includes(normalizedQuery) ?? false)
      );
    });
  }, [rentals, searchQuery]);
  const columns = useMemo<ColumnDef<RentalRecord>[]>(
    () => [
      {
        id: "assetName",
        accessorKey: "assetName",
        header: "Asset",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="label-medium text-onSurface">{row.original.assetName}</span>
            <span className="body-small text-onSurfaceVariant">{row.original.id}</span>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: "customerName",
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="label-medium text-onSurface">{row.original.customerName}</span>
            <span className="body-small text-onSurfaceVariant">{row.original.contactEmail ?? "No email"}</span>
          </div>
        ),
        enableSorting: true,
        enableColumnFilter: false,
      },
      {
        id: "location",
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
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge text={row.original.status} variant={rentalStatusToneMap[row.original.status]} dot/>
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
            <span className="label-medium text-onSurface">{formatDate(row.original.startDate)}</span>
            <span className="body-small text-onSurfaceVariant">to {formatDate(row.original.endDate)}</span>
          </div>
        ),
        size: 180,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: "quantity",
        accessorKey: "quantity",
        header: "Qty",
        cell: ({ row }) => (
          <div className="text-center label-medium text-onSurface">{row.original.quantity}</div>
        ),
        size: 80,
        enableSorting: true,
        enableColumnFilter: false,
      },
    ],
    []
  );

  useEffect(() => {
    if (visibleColumns.length === 0 && columns.length > 0) {
      setVisibleColumns(columns);
    }
  }, [columns, visibleColumns.length]);

  const resolvedColumns = visibleColumns.length > 0 ? visibleColumns : columns;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 mb-4">
        <TableColumnVisibility columns={columns} visibleColumns={resolvedColumns} setVisibleColumns={setVisibleColumns}/>
        <div className="flex-shrink-0 w-80">
          <Search searchValue={searchQuery} onSearch={setSearchQuery} searchPlaceholder={searchPlaceholder} live={true} />
        </div>
      </div>
      <DataTableExtended<RentalRecord, unknown> columns={resolvedColumns} data={filteredRentals} showPagination/>
    </div>
  );
};

const Table: React.FC<TableProps> = (props) => {
  if (props.variant === "allocation") {
    const { assets, searchQuery, onSearchQueryChange, searchPlaceholder } = props;
    return (
      <AllocationVariantTable variant="allocation" assets={assets} searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} searchPlaceholder={searchPlaceholder}/>
    );
  }

  const { rentals, searchQuery, onSearchQueryChange, searchPlaceholder } = props;
  return (
    <RentalVariantTable variant="rental" rentals={rentals} searchQuery={searchQuery} onSearchQueryChange={onSearchQueryChange} searchPlaceholder={searchPlaceholder}/>
  );
};

export type { AllocationVariantProps, RentalVariantProps };
export default Table;
