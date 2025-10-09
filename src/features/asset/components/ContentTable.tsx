import {
  type Table as TanStackTable,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnFiltersState,
  type HeaderGroup,
  type Header,
  type Row,
  getFacetedRowModel,
  getFacetedUniqueValues
} from "@tanstack/react-table";
import { Skeleton } from "@ui/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  // MemoizedTableFilter,
  TablePagination,
} from "@ui/components/Table";

// Search testing
import { MemoizedTableFilter } from "./ContentTableFilter";

import { cn } from "@/utils/utils";
import { CaretDownFilled, CaretUpDown, CaretUpFilled } from "@/assets/icons";
import { useState, type CSSProperties } from "react";
import { createSelectionColumn } from "@ui/components/Table/createSelectionColumn";
import {
  type CustomColumnDef,
  // fuzzyArrayIncludesFilterFn,
  // multiSelectFilterFn,
} from "@ui/utils";

// Search testing
import {
  fuzzyArrayIncludesFilterFn,
  multiSelectFilterFn,
  searchIncludesFilterFn
} from "./contentTableFilterUtil";


import { useTranslation } from "react-i18next";

// ******************************  README  ***************************************

// To modify the default styles to your own styles:
// 1. create 'dataTableStyles.tsx' in styles folder, add below code

// ```
// import { setDataTableTheme } from "@/components/ui/components";
//
// setDataTableTheme({
//   base: "",
//   className: "",
// });
// ```

// 2. add `import './styles/dataTableStyles'` into main.tsx

// *****************************************************************************

// --------------------------------
//
// ------- Default styles ---------
//
// --------------------------------

const DATA_TABLE_STYLES = {
  base: "flex-1 rounded-md border border-outline",
  className: "",
};

// --------------------------------
//
// ------------ Props -------------
//
// --------------------------------

interface DataTableProps<TData, TValue> {
  columns: (ColumnDef<TData, TValue> | CustomColumnDef<TData, TValue>)[];
  data: TData[];
  showPagination?: boolean;
  showCheckbox?: boolean;
  isLoading?: boolean;
  enableRowClickSelection?: boolean;
  onRowSelectionChange?: (
    selectedRows: TData[],
    selectedRowIds: string[]
  ) => void;
  rowSelection?: Record<string, boolean>;
  className?: string;

  // External pagination props
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  selectedCount?: number;
}

// --------------------------------
//
// --------- Components -----------
//
// --------------------------------

function DataTable<TData, TValue>({
  columns,
  data,
  showPagination = true,
  showCheckbox = false,
  isLoading = false,
  className,
  enableRowClickSelection = false,
  onRowSelectionChange,
  rowSelection,
  // External pagination props
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedCount,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<
    Record<string, boolean>
  >({});

  const currentRowSelection = rowSelection ?? internalRowSelection;

  const isExternalPagination =
    totalCount !== undefined &&
    currentPage !== undefined &&
    pageSize !== undefined;

  const table = useReactTable({
    data,
    columns: showCheckbox
      ? [createSelectionColumn<TData, TValue>(), ...columns]
      : columns,
    enableRowSelection: showCheckbox || enableRowClickSelection,
    filterFromLeafRows: true,
    getCoreRowModel: getCoreRowModel(),

    // Only add pagination if showPagination is true AND it's not external pagination
    ...(showPagination &&
      !isExternalPagination && {
        getPaginationRowModel: getPaginationRowModel(),
      }),

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: (updaterOrValue) => {
      const newSelection =
        typeof updaterOrValue === "function"
          ? updaterOrValue(currentRowSelection)
          : updaterOrValue;

      if (!rowSelection) {
        setInternalRowSelection(newSelection);
      }

      if (onRowSelectionChange) {
        const selectedRowIds = Object.keys(newSelection).filter(
          (key) => newSelection[key]
        );
        const selectedRows = selectedRowIds.map((id) => {
          const row = table.getRow(id);
          return row.original;
        });

        onRowSelectionChange(selectedRows, selectedRowIds);
      }
    },
    filterFns: {
      multiSelect: multiSelectFilterFn,
      fuzzyArrayIncludes: fuzzyArrayIncludesFilterFn,
      searchIncludes: searchIncludesFilterFn
    },
    defaultColumn: {
      filterFn: "multiSelect",
      enableColumnFilter: true,
      enableSorting: true,
      enableMultiSort: true,
    },
    state: {
      sorting,
      columnFilters,
      rowSelection: currentRowSelection,
    },
    initialState: {
      pagination: {
        pageSize: showPagination ? 10 : 999999,
      },
    },
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          DATA_TABLE_STYLES.base,
          DATA_TABLE_STYLES.className,
          className
        )}
      >
        <Table style={{ width: "100%", height: "100%" }}>
          <TableHeader>
            <DataTableHeader headerGroups={table.getHeaderGroups()} />
          </TableHeader>
          <DataTableBody
            table={table}
            isLoading={isLoading}
            dataColumns={columns}
            enableRowClickSelection={enableRowClickSelection}
          />
        </Table>
      </div>
      {showPagination && (
        <TablePagination
          table={isExternalPagination ? undefined : table}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          selectedCount={selectedCount}
        />
      )}
    </div>
  );
}

function DataTableHeader<TData>({
  headerGroups,
}: {
  headerGroups: HeaderGroup<TData>[];
}) {
  return headerGroups.map((headerGroup) => (
    <TableRow key={headerGroup.id} className="hover:bg-tertiaryContainer/80">
      {headerGroup.headers.map((header, index) => {
        const column = header.column.columnDef as CustomColumnDef<TData>;

        const prevHeader = headerGroup.headers[index - 1];
        const prevColumnDef = prevHeader.column.columnDef as
          | (ColumnDef<TData> & {
              sticky?: boolean;
              stickyRight?: number;
            })
          | undefined;
        const prevIsStickyRight =
          prevColumnDef?.sticky === true &&
          prevColumnDef.stickyRight !== undefined;

        return (
          <TableHead
            key={header.id}
            className={cn("relative group", {
              "rounded-tl-md": index === 0,
              "rounded-tr-md": index === headerGroup.headers.length - 1,
              "bg-tertiaryContainer": column.sticky,
              "shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]":
                column.stickyLeft &&
                !(
                  headerGroup.headers[index + 1]?.column
                    .columnDef as CustomColumnDef<TData>
                ).sticky,
              "shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]":
                column.stickyRight && !prevIsStickyRight,
            })}
            style={{ ...getCommonPinningStyles(column) }}
          >
            <div className="flex items-center gap-2">
              <div
                onClick={header.column.getToggleSortingHandler()}
                className={cn(
                  "flex items-center gap-2 w-full justify-between",
                  {
                    "cursor-pointer select-none": header.column.getCanSort(),
                  }
                )}
              >
                {!header.isPlaceholder &&
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                <SortIndicator header={header} />
              </div>

              {header.column.getCanFilter() && (
                <MemoizedTableFilter
                  column={header.column}
                  uniqueValues={Array.from(
                    new Set(
                      Array.from(
                        header.column.getFacetedUniqueValues().keys()
                      ).flatMap((v) => {
                        if (Array.isArray(v)) return v.map(String);
                        if (typeof v === "string")
                          return v.split(",").map((s) => s.trim());
                        return [String(v)];
                      })
                    )
                  )}
                  filterAlignment="center"
                  filterType={header.column.getFilterFn() === searchIncludesFilterFn ? "search" : "checkbox" }
                />
              )}
            </div>
          </TableHead>
        );
      })}
    </TableRow>
  ));
}

function DataTableBody<TData, TValue>({
  isLoading,
  table,
  dataColumns,
  enableRowClickSelection = false,
}: {
  isLoading: boolean;
  table: TanStackTable<TData>;
  dataColumns: ColumnDef<TData, TValue>[] | CustomColumnDef<TData, TValue>[];
  onClickRow?: (rowId: string) => void;
  enableRowClickSelection?: boolean;
}) {
  return (
    <TableBody>
      {isLoading ? (
        <SkeletonRow columns={dataColumns} rowCount={5} />
      ) : table.getRowModel().rows.length ? (
        <DataTableRow
          table={table}
          enableRowClickSelection={enableRowClickSelection}
        />
      ) : (
        <EmptyDataRow columnLength={dataColumns.length} />
      )}
    </TableBody>
  );
}

function DataTableRow<TData>({
  table,
  enableRowClickSelection = false,
}: {
  table: TanStackTable<TData>;
  enableRowClickSelection?: boolean;
}) {
  const handleRowClick = (row: Row<TData>, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInteractiveElement = target.closest(
      'button, a, input, select, textarea, [role="button"]'
    );

    if (
      enableRowClickSelection &&
      !isInteractiveElement &&
      row.getCanSelect()
    ) {
      event.preventDefault();
      row.toggleSelected();
    }
  };

  return table.getRowModel().rows.map((row, index) => {
    const isLastRow = index === table.getRowModel().rows.length - 1;
    const cells = row.getVisibleCells();

    return (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        onClick={(event) => { handleRowClick(row, event); }}
        className={cn(
          enableRowClickSelection && row.getCanSelect() && "cursor-pointer"
        )}
      >
        {cells.map((cell, i) => {
          const column = cell.column.columnDef as CustomColumnDef<TData>;
          const prevCell = cells[i - 1];
          const prevColumnDef = prevCell.column.columnDef as
            | (ColumnDef<TData> & {
                sticky?: boolean;
                stickyRight?: number;
              })
            | undefined;
          const prevIsStickyRight =
            prevColumnDef?.sticky === true &&
            prevColumnDef.stickyRight !== undefined;
          return (
            <TableCell
              key={cell.id}
              style={{ ...getCommonPinningStyles(column) }}
              className={cn({
                "rounded-bl-md": isLastRow && i === 0,
                "rounded-br-md": isLastRow && i === cells.length - 1,
                "bg-surfaceContainerLow": column.sticky,
                "shadow-[2px_0_8px_-2px_rgba(0,0,0,0.08)]":
                  column.stickyLeft &&
                  !(cells[i + 1]?.column.columnDef as CustomColumnDef<TData>).sticky,
                "shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.08)]":
                  column.stickyRight && !prevIsStickyRight,
              })}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    );
  });
}

function SortIndicator<TData>({ header }: { header: Header<TData, unknown> }) {
  if (!header.column.getCanSort()) return null;

  const sortState = header.column.getIsSorted();
  const Icon =
    sortState === "asc"
      ? CaretUpFilled
      : sortState === "desc"
      ? CaretDownFilled
      : CaretUpDown;

  const colorClass =
    sortState === "asc" || sortState === "desc"
      ? "text-onSurfaceVariant"
      : "text-onSwitchOffContainer";

  return (
    <Icon
      className={`w-4 h-4 min-w-[0.875rem] min-h-[0.875rem] ${colorClass}`}
    />
  );
}

function SkeletonRow<TData, TValue>({
  columns,
  rowCount,
}: {
  columns: ColumnDef<TData, TValue>[] | CustomColumnDef<TData, TValue>[];
  rowCount: number;
}) {
  return Array.from({ length: rowCount }, (_: unknown, i: number) => (
    <TableRow key={`skeleton-row-${String(i)}`} className="hover:bg-transparent">
      {columns.map((_: unknown, j: number) => (
        <TableCell key={`skeleton-cell-${String(i)}-${String(j)}`}>
          <Skeleton className="h-5 rounded-sm" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function EmptyDataRow({ columnLength }: { columnLength: number }) {
  const { t } = useTranslation("common");
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnLength} className="text-onSurface text-center">
        {t("No Results Found")}
      </TableCell>
    </TableRow>
  );
}

const getCommonPinningStyles = <TData,>(
  column: CustomColumnDef<TData>
): CSSProperties => {
  const isPinned = column.sticky;

  return {
    left: isPinned && column.stickyLeft !== undefined ? `${String(column.stickyLeft)}px` : undefined,
    right: isPinned && column.stickyRight !== undefined ? `${String(column.stickyRight)}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    zIndex: isPinned ? 1 : 0,
  };
};

export { DataTable };
