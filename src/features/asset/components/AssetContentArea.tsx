import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/components/Table/index";
import { type CustomColumnDef } from "@/components/ui/utils/dataTable";
import CreateAsset from "./CreateAsset";
import type { Asset } from "@/types/asset";
import { useGetAsset, useCreateAsset } from "../hooks/useAssetService";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import { TabHeader } from "@/components/TabHeader";
import Search from "@/components/Search";


// Column definitions for TanStack Table
const createColumns = (): CustomColumnDef<Asset>[] => [
  {
    id: "id",
    accessorKey: "id",
    header: "Asset ID",
    meta: { label: "Asset ID" },
  },
  {
    id: "batchId", 
    accessorKey: "batchId", 
    header: "Batch ID",
    enableColumnFilter: false,
    meta: { label: "Batch ID" },
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Asset Name", 
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
    meta: { label: "Acquire Date" },
  },
  {
    id: "purchaseDate", 
    accessorKey: "purchaseDate", 
    header: "Purchase Date",
    meta: { label: "Purchase Date" },
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
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [searchValue, setSearchValue] = useState('');
  const { data: assets } = useGetAsset();
  const createAssetMutation = useCreateAsset(() => {
    setView('list');
  });
  
  // Create columns and manage visibility
  const allColumns = useMemo(() => createColumns(), []);
  const visibleColumns = allColumns;

  // Handle row selection
  const handleRowSelectionChange = (_rows: Asset[], rowIds: string[]) => {
    setSelectedRowIds(rowIds);
  };

  // Summary cards data
  const summaryCardsData: SummaryCardItem[] = [
    {
      label: "Total Assets",
      value: assets?.length.toString() ?? "0",
      description: "Total registered assets",
    },
    {
      label: "Total Asset Cost",
      value: `RM ${(assets?.reduce((sum, asset) => sum + (asset.cost || 0), 0) ?? 0).toLocaleString()}`,
      description: "Combined cost of all assets",
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
        <>
          <TabHeader
            title="Asset Management"
            subtitle="Manage and track all company assets"
            actions={[
              {
                label: "Add Asset",
                onAction: () => { setView('create'); },
                variant: "default",
              }
            ]}
          />

          <SummaryCards data={summaryCardsData} columns={3} />

          <Search
            searchValue={searchValue}
            searchPlaceholder="Search assets..."
            onSearch={setSearchValue}
            live={true}
          />

          <DataTable
            columns={visibleColumns}
            data={assets ?? []}
            showPagination={true}
            showCheckbox={true}
            enableRowClickSelection={true}
            onRowSelectionChange={handleRowSelectionChange}
            selectedCount={selectedRowIds.length}
          />
        </>
      ) : (
        <CreateAsset
          onBack={() => {
            setView('list');
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