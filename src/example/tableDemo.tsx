import { useMemo, useState } from "react";
import { Card } from "@/components/ui/components";
import { DataTable, TableColumnVisibility } from "@/components/ui/components/Table/index";
import { type CustomColumnDef } from "@/components/ui/utils/dataTable";

interface Demo {
  id: string;
  group: string;
  nogroup: string;
  nosort: string;
  tfdata: boolean;
}

const SAMPLE_DATA: Demo[] = [
  { id: "1", group: "GroupAlpha", nogroup: "CategoryOne", nosort: "value19z", tfdata: true },
  { id: "2", group: "GroupBeta",  nogroup: "CategoryTwo", nosort: "random85x", tfdata: false },
  { id: "3", group: "GroupAlpha", nogroup: "CategoryThree", nosort: "test33val", tfdata: true },
  { id: "4", group: "GroupBeta",  nogroup: "CategoryOne", nosort: "unsrt442k", tfdata: false },
  { id: "5", group: "GroupAlpha", nogroup: "CategoryTwo", nosort: "alpha91zz", tfdata: true },
];

// Column definitions for TanStack Table
const createColumns = (): CustomColumnDef<Demo>[] => [
  {
    id: "id",
    accessorKey: "id",
    header: "Asset ID",
    // Default multiSelect filter
  },
  {
    id: "group", 
    accessorKey: "group", 
    header: "Grouped Data",
    // Default checkbox filter
  },
  {
    id: "nogroup",
    accessorKey: "nogroup",
    header: "Not Grouped Data", 
    // No filter
    enableColumnFilter: false,
  },
  {
    id: "nosort",
    accessorKey: "nosort",
    header: "Disabled Sorting",
    // No sorting
    enableSorting: false,
  },
  {
    id: "tfdata",
    accessorKey: "tfdata",
    header: "True/False Boolean Data",
    // Format cell values to readable data
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return value ? "Yes" : "No";
    },
  },
];

export default function TableDemo() {
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  
  // Create columns and manage visibility
  const allColumns = useMemo(() => createColumns(), []);
  const [visibleColumns, setVisibleColumns] = useState<CustomColumnDef<Demo>[]>(allColumns);

  // Handle row selection
  const handleRowSelectionChange = (_rows: Demo[], rowIds: string[]) => {
    setSelectedRowIds(rowIds);
  };

  return (
      <Card className="p-3">
        {/* Header actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Component for col visibility, pass in useState */}
            <TableColumnVisibility
              columns={allColumns}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mt-3">
            {/* Actual table, pass in visible columns and data, options are below */}
          <DataTable
            columns={visibleColumns}
            data={SAMPLE_DATA}
            showPagination={true}
            showCheckbox={true}
            enableRowClickSelection={true}
            onRowSelectionChange={handleRowSelectionChange}
            selectedCount={selectedRowIds.length}
          />
        </div>
      </Card>
  );
}