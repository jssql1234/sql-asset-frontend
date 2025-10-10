import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui/components";
import { TableColumnVisibility } from "@/components/ui/components/Table/index";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type CustomColumnDef } from "@/components/ui/utils/dataTable";
import { cn } from "@/utils/utils";
import CreateAsset from "./CreateAsset";
import type { Asset } from "@/types/asset";
import { useGetAsset, useCreateAsset } from "../hooks/useAssetService";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import { TabHeader } from "@/components/TabHeader";
import Search from "@/components/Search";
import PermissionGuard from "@/components/PermissionGuard";
import { useNavigate, useLocation } from "react-router-dom";


// Column definitions for TanStack Table
const createColumns = (): CustomColumnDef<Asset>[] => [
  {
    id: "id",
    accessorKey: "id",
    header: "Asset ID",
    meta: { label: "Asset ID" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "batchId", 
    accessorKey: "batchId", 
    header: "Batch ID",
    meta: { label: "Batch ID" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Asset Name", 
    meta: { label: "Asset Name" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "group",
    accessorKey: "group",
    header: "Asset Group",
    meta: { label: "Asset Group" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    meta: { label: "Description" },
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <span className="truncate block" title={value}>
          {value}
        </span>
      );
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "acquireDate",
    accessorKey: "acquireDate",
    header: "Acquire Date",
    meta: { label: "Acquire Date" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "purchaseDate", 
    accessorKey: "purchaseDate", 
    header: "Purchase Date",
    meta: { label: "Purchase Date" },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "cost",
    accessorKey: "cost",
    header: "Cost",
    meta: { label: "Cost" },
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value.toLocaleString();
    },
    enableSorting: true,
    enableColumnFilter: false,
  },
  {
    id: "qty",
    accessorKey: "qty",
    header: "Qty",
    meta: { label: "Qty" },
    cell: ({ getValue }) => {
      const value = getValue() as number;
      return value.toLocaleString();
    },
    enableSorting: true,
    enableColumnFilter: false,
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
    enableSorting: true,
    enableColumnFilter: false,
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
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [searchValue, setSearchValue] = useState('');
  const [groupByBatch, setGroupByBatch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: assets } = useGetAsset();
  const createAssetMutation = useCreateAsset(() => {
    setView('list');
    void navigate('/asset');
  });

  // Sync view state with URL
  useEffect(() => {
    if (location.pathname === '/asset/create-asset') {
      setView('create');
    } else if (location.pathname === '/asset') {
      setView('list');
    }
  }, [location.pathname, setView]);
  
  // Create columns and manage visibility
  const allColumns = useMemo(() => createColumns(), []);
  const [visibleColumns, setVisibleColumns] = useState<CustomColumnDef<Asset>[]>(allColumns);

  // Handle row selection
  const handleRowSelectionChange = (_rows: Asset[], rowIds: string[]) => {
    setSelectedRowIds(rowIds);
  };

  // Filter assets based on search value
  const filteredAssets = useMemo(() => {
    if (!assets || !searchValue.trim()) return assets;

    const searchLower = searchValue.toLowerCase().trim();
    return assets.filter(asset =>
      (asset.id || '').toLowerCase().includes(searchLower) ||
      (asset.batchId || '').toLowerCase().includes(searchLower) ||
      (asset.name || '').toLowerCase().includes(searchLower) ||
      (asset.group || '').toLowerCase().includes(searchLower) ||
      (asset.description || '').toLowerCase().includes(searchLower)
    );
  }, [assets, searchValue]);

  // Summary cards data
  const summaryCardsData: SummaryCardItem[] = [
    {
      label: "Total Asset Cost",
      value: `RM ${(assets?.reduce((sum, asset) => sum + (asset.cost || 0), 0) ?? 0).toLocaleString()}`,
      description: "Combined cost of all assets",
    },
    {
      label: "Total Assets",
      value: assets?.length.toString() ?? "0",
      description: "Total registered assets",
    },
    {
      label: "Active Assets",
      value: assets?.filter(asset => asset.active).length.toString() ?? "0",
      description: "Currently active assets",
    },
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
    <>
      {view === 'list' ? (
        <div>
          <TabHeader
            title="Asset Management"
            subtitle="Manage and track all company assets"
            actions={[]}
          />

          <div className="mb-6">
            <SummaryCards data={summaryCardsData} columns={3} />
          </div>

          <div className="mb-6">
            <Search
              searchValue={searchValue}
              searchPlaceholder="Search by asset ID, batch ID, asset name, asset group, description"
              onSearch={setSearchValue}
              live={true}
            />
          </div>

          <Card className="p-3">
          {/* Header actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* <div className="label-medium-bold text-onSurface">Asset Overview</div> */}
              <div className="flex bg-secondaryContainer text-onSecondaryContainer rounded overflow-hidden"
              onClick={() => {
                setGroupByBatch(!groupByBatch);
              }}>
                <button
                  type="button"
                  className={cn(
                    "px-3 py-1 body-small",
                    !groupByBatch && "bg-primary text-onPrimary"
                  )}
                >
                  Asset
                </button>
                <button
                  type="button"
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
          
              <Button size="sm" onClick={() => {
                setView('create');
                void navigate('/asset/create-asset');
              }}>
                Add
              </Button>
              </PermissionGuard>
              {selectedRowIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                  <Button variant="destructive" size="sm" onClick={() => {
                    void navigate('/disposal');
                  }}>Dispose</Button>
                  <div className="body-small text-onSurfaceVariant">{selectedRowIds.length} selected</div>
                </div>
              )}
            </div>
          </div>

          <DataTableExtended
            columns={visibleColumns}
            data={filteredAssets ?? []}
            showPagination={true}
            showCheckbox={true}
            enableRowClickSelection={true}
            onRowSelectionChange={handleRowSelectionChange}
            selectedCount={selectedRowIds.length}
          />
        </Card>
        </div>
      ) : (
        <CreateAsset
          onBack={() => {
            setView('list');
            void navigate('/asset');
          }}
          onSuccess={(data) => {
            const asset: Asset = {
              id: data.code,
              batchId: data.batchID ?? '',
              name: data.assetName,
              group: data.assetGroup,
              description: data.description ?? '',
              acquireDate: data.acquireDate || '',
              purchaseDate: data.purchaseDate ?? '',
              cost: Number(data.cost ?? '0') || 0,
              qty: data.quantity,
              active: !data.inactive,
            };
            createAssetMutation.mutate(asset);
          }}
        />
      )}
    </>
  );
}