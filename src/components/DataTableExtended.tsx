/**
 * DataTableExtended - Extended wrapper for DataTable with additional features
 * 
 * This component extends the original DataTable from the UI submodule with:
 * - onRowDoubleClick support
 * - Faceted filtering (getFacetedRowModel, getFacetedUniqueValues)
 * 
 * Note: We use a custom table instance to add faceted filtering without
 * modifying the submodule's DataTable.tsx
 * 
 * Usage:
 * import { DataTableExtended } from '@/components/DataTableExtended';
 * 
 * <DataTableExtended
 *   columns={columns}
 *   data={data}
 *   onRowDoubleClick={(row) => console.log('Double clicked:', row)}
 *   // ... all other DataTable props
 * />
 */

import { useEffect, useRef, useState } from 'react';
import { 
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type Table as TanStackTable,
  type Header,
  type Row,
} from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/components';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  MemoizedTableFilter,
  TablePagination,
} from '@/components/ui/components/Table';
import { cn } from '@/utils/utils';
import { CaretDownFilled, CaretUpDown, CaretUpFilled } from '@/assets/icons';
import { createSelectionColumn } from '@/components/ui/components/Table/createSelectionColumn';
import type { CustomColumnDef } from '@/components/ui/utils/dataTable';
import {
  multiSelectFilterFn,
  fuzzyArrayIncludesFilterFn,
} from '@/components/ui/utils/tableFilter';
import { useTranslation } from 'react-i18next';

// Extend the original DataTableProps with onRowDoubleClick
interface DataTableExtendedProps<TData, TValue> {
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
  onRowDoubleClick?: (row: TData) => void;

  // External pagination props
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  selectedCount?: number;
}

export function DataTableExtended<TData, TValue>({
  onRowDoubleClick,
  data,
  columns,
  showPagination = true,
  showCheckbox = false,
  isLoading = false,
  enableRowClickSelection = false,
  onRowSelectionChange,
  rowSelection,
  className,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  selectedCount,
}: DataTableExtendedProps<TData, TValue>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<Record<string, boolean>>({});

  const currentRowSelection = rowSelection ?? internalRowSelection;
  const isExternalPagination = totalCount !== undefined && currentPage !== undefined && pageSize !== undefined;

  // Create table instance with faceted filtering support
  const table = useReactTable({
    data,
    columns: showCheckbox ? [createSelectionColumn<TData, TValue>(), ...columns] : columns,
    enableRowSelection: showCheckbox || enableRowClickSelection,
    filterFromLeafRows: true,
    getCoreRowModel: getCoreRowModel(),
    
    ...(showPagination && !isExternalPagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Add faceted filtering support
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: (updaterOrValue) => {
      const newSelection =
        typeof updaterOrValue === 'function' ? updaterOrValue(currentRowSelection) : updaterOrValue;

      if (!rowSelection) {
        setInternalRowSelection(newSelection);
      }

      if (onRowSelectionChange) {
        const selectedRowIds = Object.keys(newSelection).filter((key) => newSelection[key]);
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
    },
    defaultColumn: {
      filterFn: 'multiSelect',
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
  });

  // Double-click handler
  useEffect(() => {
    if (!onRowDoubleClick) return;
    
    const container = containerRef.current;
    if (!container) return;

    const handleDoubleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      const row = target.closest('tbody tr');
      if (!row) return;

      const isInteractiveElement = target.closest(
        'button, a, input, select, textarea, [role="button"], [role="checkbox"]'
      );
      if (isInteractiveElement) return;

      const tbody = row.parentElement;
      if (!tbody) return;

      const rows = Array.from(tbody.querySelectorAll('tr'));
      const rowIndex = rows.indexOf(row as HTMLTableRowElement);

      if (rowIndex >= 0 && rowIndex < data.length) {
        onRowDoubleClick(data[rowIndex]);
      }
    };

    container.addEventListener('dblclick', handleDoubleClick as EventListener);
    return () => {
      container.removeEventListener('dblclick', handleDoubleClick as EventListener);
    };
  }, [onRowDoubleClick, data]);

  const enhancedClassName = onRowDoubleClick
    ? `${className ?? ''} [&_tbody_tr]:cursor-pointer`
    : className;

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div className={cn('flex-1 rounded-md border border-outlineVariant', enhancedClassName)}>
        <Table style={{ width: '100%', height: '100%' }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-tertiaryContainer/80">
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn('relative group', {
                        'rounded-tl-md': index === 0,
                        'rounded-tr-md': index === headerGroup.headers.length - 1,
                      })}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn('flex items-center gap-2 w-full justify-between', {
                            'cursor-pointer select-none': header.column.getCanSort(),
                          })}
                        >
                          {!header.isPlaceholder &&
                            flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIndicator header={header} />
                        </div>

                        {header.column.getCanFilter() && (
                          <MemoizedTableFilter
                            column={header.column}
                            uniqueValues={Array.from(
                              new Set(
                                Array.from(header.column.getFacetedUniqueValues().keys()).flatMap(
                                  (v) => {
                                    if (Array.isArray(v)) return v.map(String);
                                    if (typeof v === 'string')
                                      return v.split(',').map((s) => s.trim());
                                    return [String(v)];
                                  }
                                )
                              )
                            )}
                            filterAlignment="center"
                          />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              <SkeletonRow columns={columns} rowCount={5} />
            ) : table.getRowModel().rows.length ? (
              <DataTableRow
                table={table}
                enableRowClickSelection={enableRowClickSelection}
              />
            ) : (
              <EmptyDataRow columnLength={columns.length} />
            )}
          </TableBody>
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

// Helper components
function SortIndicator<TData, TValue>({ header }: { header: Header<TData, TValue> }) {
  if (!header.column.getCanSort()) return null;

  const sortState = header.column.getIsSorted();
  const Icon =
    sortState === 'asc' ? CaretUpFilled : sortState === 'desc' ? CaretDownFilled : CaretUpDown;

  const colorClass =
    sortState === 'asc' || sortState === 'desc'
      ? 'text-onSurfaceVariant'
      : 'text-onSwitchOffContainer';

  return <Icon className={`w-4 h-4 min-w-[0.875rem] min-h-[0.875rem] ${colorClass}`} />;
}

function SkeletonRow<TData, TValue>({
  columns,
  rowCount,
}: {
  columns: (ColumnDef<TData, TValue> | CustomColumnDef<TData, TValue>)[];
  rowCount: number;
}) {
  return (
    <>
      {Array.from({ length: rowCount }, (_, i) => (
        <TableRow key={`skeleton-row-${i.toString()}`} className="hover:bg-transparent">
          {columns.map((_, j) => (
            <TableCell key={`skeleton-cell-${i.toString()}-${j.toString()}`}>
              <Skeleton className="h-5 rounded-sm" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

function EmptyDataRow({ columnLength }: { columnLength: number }) {
  const { t } = useTranslation('common');
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnLength} className="text-onSurface text-center">
        {t('No records found. Add a new entry to get started.')}
      </TableCell>
    </TableRow>
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

    if (enableRowClickSelection && !isInteractiveElement && row.getCanSelect()) {
      event.preventDefault();
      row.toggleSelected();
    }
  };

  return (
    <>
      {table.getRowModel().rows.map((row, index) => {
        const isLastRow = index === table.getRowModel().rows.length - 1;
        const cells = row.getVisibleCells();

        return (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && 'selected'}
            onClick={(event) => { handleRowClick(row, event); }}
            className={cn(
              enableRowClickSelection && row.getCanSelect() && 'cursor-pointer'
            )}
          >
            {cells.map((cell, i) => (
              <TableCell
                key={cell.id}
                className={cn({
                  'rounded-bl-md': isLastRow && i === 0,
                  'rounded-br-md': isLastRow && i === cells.length - 1,
                })}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </>
  );
}

// Re-export the original DataTable for convenience (optional)
export { DataTable } from '@/components/ui/components/Table';
