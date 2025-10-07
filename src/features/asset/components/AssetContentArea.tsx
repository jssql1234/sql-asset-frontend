import { useMemo, useState } from "react";
import { Button, Card } from "@/components/ui/components";
// import { DataTable, TableColumnVisibility } from "@/components/ui/components/Table/index";
import { TableColumnVisibility } from "@/components/ui/components/Table/index";
import { DataTable } from "@/features/asset/components/ContentTable";
import { type CustomColumnDef } from "@/components/ui/utils/dataTable";
import { cn } from "@/utils/utils";
import CreateAsset from "./CreateAsset";
import type { Asset } from "@/types/asset";
import { useGetAsset, useCreateAsset } from "../hooks/useAssetService";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import PermissionGuard from "@/components/PermissionGuard";
import { useNavigate } from "react-router-dom";


// Column definitions for TanStack Table
const createColumns = (): CustomColumnDef<Asset>[] => [
  {
    id: "id",
    accessorKey: "id",
    header: "Asset ID",
    filterFn: "searchIncludes",
    meta: { label: "Asset ID" },
  },
  {
    id: "batchId", 
    accessorKey: "batchId", 
    header: "Batch ID",
    filterFn: "searchIncludes",
    enableColumnFilter: false,
    meta: { label: "Batch ID" },
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Asset Name", 
    filterFn: "searchIncludes",
    meta: { label: "Asset Name" },
  },
  {
    id: "group",
    accessorKey: "group",
    header: "Asset Group",
    meta: { label: "Asset Group" },
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    filterFn: "searchIncludes",
    meta: { label: "Description" },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <span className="truncate block" title={value}>
          {value}
        </span>
      );
    },
  },
  {
    id: "acquireDate",
    accessorKey: "acquireDate",
    header: "Acquire Date",
    filterFn: "searchIncludes",
    meta: { label: "Acquire Date" },
  },
  {
    id: "purchaseDate", 
    accessorKey: "purchaseDate", 
    header: "Purchase Date",
    filterFn: "searchIncludes",
    meta: { label: "Purchase Date" },
  },
  {
    id: "cost",
    accessorKey: "cost",
    header: "Cost",
    filterFn: "searchIncludes",
    meta: { label: "Cost" },
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value.toLocaleString();
    },
  },
  {
    id: "qty",
    accessorKey: "qty",
    header: "Qty",
    filterFn: "searchIncludes",
    meta: { label: "Qty" },
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return (value ?? 0).toLocaleString();
    },
  },
  // {
  //   id: "qe",
  //   accessorKey: "qe",
  //   header: "QE", 
  //   meta: { label: "QE" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
  // {
  //   id: "re",
  //   accessorKey: "re",
  //   header: "RE",
  //   meta: { label: "RE" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
  // {
  //   id: "ia",
  //   accessorKey: "ia",
  //   header: "IA",
  //   meta: { label: "IA" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
  // {
  //   id: "aa",
  //   accessorKey: "aa",
  //   header: "AA",
  //   meta: { label: "AA" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
  // {
  //   id: "aca",
  //   accessorKey: "aca",
  //   header: "ACA",
  //   meta: { 
  //     label: "ACA",
  //     filterOptions: { "true": "Yes", "false": "No" }
  //   },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as boolean;
  //     return value ? "Yes" : "No";
  //   },
  // },
  {
    id: "active",
    accessorKey: "active",
    header: "Active",
    meta: { 
      label: "Active",
      filterOptions: { "true": "Yes", "false": "No" }
    },
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return value ? "Yes" : "No";
    },
  },
  // {
  //   id: "personalUsePct",
  //   accessorKey: "personalUsePct",
  //   header: "Personal Use %",
  //   meta: { label: "Personal Use %" },
  //   cell: ({ getValue }) => {
  //     const value = getValue() as number;
  //     return value.toLocaleString();
  //   },
  // },
];

export default function AssetContentArea() {
  const [groupByBatch, setGroupByBatch] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const navigate = useNavigate();
  const { data: assets } = useGetAsset();
  const createAssetMutation = useCreateAsset(() => setView('list'));
  
  // Create columns and manage visibility
  const allColumns = useMemo(() => createColumns(), []);
  const [visibleColumns, setVisibleColumns] = useState<CustomColumnDef<Asset>[]>(allColumns);

  // Handle row selection
  const handleRowSelectionChange = (_rows: Asset[], rowIds: string[]) => {
    setSelectedRowIds(rowIds);
  };

  // Summary cards data
  const summaryCardsData: SummaryCardItem[] = [
    {
      label: "Initial Allowance",
      value: "RM 21.5K",
      description: "Current year",
    },
    {
      label: "Annual Allowance",
      value: "RM 64.5K",
      description: "Current year",
    },
    {
      label: "Total Depreciation",
      value: "RM 21.4K",
      description: "Current year",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      {view === 'list' && (
        <SummaryCards data={summaryCardsData} columns={3} />
      )}

      {view === 'list' ? (
        <Card className="p-3">
          {/* Header actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* <div className="label-medium-bold text-onSurface">Asset Overview</div> */}
              <div className="flex bg-secondaryContainer text-onSecondaryContainer rounded overflow-hidden"
              onClick={() => setGroupByBatch(!groupByBatch)}>
                <button
                  className={cn(
                    "px-3 py-1 body-small",
                    !groupByBatch && "bg-primary text-onPrimary"
                  )}
                >
                  Asset
                </button>
                <button
                  className={cn(
                    "px-3 py-1 body-small",
                    groupByBatch && "bg-primary text-onPrimary"
                  )}
                >
                  Batch
                </button>
              </div>
              <TableColumnVisibility
                columns={allColumns}
                visibleColumns={visibleColumns}
                setVisibleColumns={setVisibleColumns}
                className="size-32"
              />
            </div>
            <div className="flex items-center gap-2">
              <PermissionGuard feature="maintainItem" action="entryNew">
          
              <Button size="sm" onClick={() => setView('create')}>
                Add
              </Button>
              </PermissionGuard>
              {selectedRowIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                  <Button variant="destructive" size="sm" onClick={() => navigate('/disposal')}>Dispose</Button>
                  <div className="body-small text-onSurfaceVariant">{selectedRowIds.length} selected</div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="mt-3">
            <DataTable
              columns={visibleColumns}
              data={assets || []}
              showPagination={true}
              showCheckbox={true}
              enableRowClickSelection={true}
              onRowSelectionChange={handleRowSelectionChange}
              selectedCount={selectedRowIds.length}
            />
          </div>
        </Card>
      ) : (
        <CreateAsset
          onBack={() => setView('list')}
          onSuccess={(data) => {
            const asset: Asset = {
              id: data.code,
              batchId: data.batchID || '',
              name: data.assetName,
              group: data.assetGroup,
              description: data.description || '',
              acquireDate: data.acquireDate || '',
              purchaseDate: data.purchaseDate || '',
              cost: parseFloat(data.cost || '0') || 0,
              qty: data.quantity,
              active: !data.inactive,
            };
            createAssetMutation.mutate(asset);
          }}
        />
      )}

    </div>
  );
}