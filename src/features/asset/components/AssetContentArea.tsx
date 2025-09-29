import { useMemo, useState } from "react";
import { Button, Card } from "@/components/ui/components";
// import { DataTable, TableColumnVisibility } from "@/components/ui/components/Table/index";
import { TableColumnVisibility } from "@/components/ui/components/Table/index";
import { DataTable } from "@/features/asset/components/ContentTable";
import { type CustomColumnDef } from "@/components/ui/utils/dataTable";
import { cn } from "@/utils/utils";
import CreateAssetModal from "./CreateAssetModal";

type AssetRow = {
  id: string;
  batchId: string;
  name: string;
  group: string;
  description: string;
  acquireDate: string;
  purchaseDate: string;
  cost: number;
  qty: number;
  // qe: number;
  // re: number;
  // ia: number;
  // aa: number;
  // aca: boolean;
  active: boolean;
  // personalUsePct: number;
};

const SAMPLE_ASSETS: AssetRow[] = [
  {
    id: "AS-00001",
    batchId: "B-2024-01",
    name: "Production Line A12",
    group: "Plant & Machinery",
    description: "Block A",
    acquireDate: "2021-01-15",
    purchaseDate: "2021-01-01",
    cost: 21500,
    qty: 1,
    // qe: 21500,
    // re: 5000,
    // ia: 20,
    // aa: 10,
    // aca: true,
    active: true,
    // personalUsePct: 0,
  },
  {
    id: "AS-00002",
    batchId: "B-2024-02",
    name: "Block A Factory",
    group: "Industrial Building",
    description: "Block A",
    acquireDate: "2021-05-20",
    purchaseDate: "2021-05-15",
    cost: 64500,
    qty: 1,
    // qe: 64500,
    // re: 20000,
    // ia: 20,
    // aa: 20,
    // aca: false,
    active: true,
    // personalUsePct: 10,
  },
  {
    id: "AS-00003",
    batchId: "B-2024-03",
    name: "Block B Factory",
    group: "Industrial Building",
    description: "Block B",
    acquireDate: "2021-05-20",
    purchaseDate: "2021-05-15",
    cost: 64500,
    qty: 1,
    // qe: 64500,
    // re: 20000,
    // ia: 20,
    // aa: 20,
    // aca: false,
    active: true,
    // personalUsePct: 10,
  },
  {
    id: "AS-00004",
    batchId: "B-2024-02",
    name: "Printer A10",
    group: "Plant & Machinery",
    description: "Block B",
    acquireDate: "2021-05-20",
    purchaseDate: "2021-05-15",
    cost: 64500,
    qty: 1,
    // qe: 64500,
    // re: 20000,
    // ia: 20,
    // aa: 20,
    // aca: false,
    active: true,
    // personalUsePct: 10,
  },
];

// Column definitions for TanStack Table
const createColumns = (): CustomColumnDef<AssetRow>[] => [
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
  const [groupByBatch, setGroupByBatch] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Create columns and manage visibility
  const allColumns = useMemo(() => createColumns(), []);
  const [visibleColumns, setVisibleColumns] = useState<CustomColumnDef<AssetRow>[]>(allColumns);

  // Handle row selection
  const handleRowSelectionChange = (_rows: AssetRow[], rowIds: string[]) => {
    setSelectedRowIds(rowIds);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-surface border border-outline p-4">
          <div className="label-medium text-onSurface">Initial Allowance</div>
          <div className="title-small text-onSurface mt-1">RM 21.5K</div>
          <div className="body-small text-onSurfaceVariant">Current year</div>
        </Card>
        <Card className="bg-surface border border-outline p-4">
          <div className="label-medium text-onSurface">Annual Allowance</div>
          <div className="title-small text-onSurface mt-1">RM 64.5K</div>
          <div className="body-small text-onSurfaceVariant">Current year</div>
        </Card>
        <Card className="bg-surface border border-outline p-4">
          <div className="label-medium text-onSurface">Total Depreciation</div>
          <div className="title-small text-onSurface mt-1">RM 21.4K</div>
          <div className="body-small text-onSurfaceVariant">Current year</div>
        </Card>
      </div> */}

      {/* Unified Card wrapping header, controls, table and pagination (no border) */}
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
            <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
              Add
            </Button>
            {selectedRowIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
                <Button variant="outline" size="sm">Dispose</Button>
                <div className="body-small text-onSurfaceVariant">{selectedRowIds.length} selected</div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-3">
          <DataTable
            columns={visibleColumns}
            data={SAMPLE_ASSETS}
            showPagination={true}
            showCheckbox={true}
            enableRowClickSelection={true}
            onRowSelectionChange={handleRowSelectionChange}
            selectedCount={selectedRowIds.length}
          />
        </div>
      </Card>

      {/* Create Asset Modal */}
      <CreateAssetModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

    </div>
  );
}