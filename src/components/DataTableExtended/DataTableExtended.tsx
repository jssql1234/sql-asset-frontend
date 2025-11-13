/**
 * DataTableExtended - Extended wrapper for DataTable with additional features
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, getFacetedRowModel, getFacetedUniqueValues, 
         getExpandedRowModel, getGroupedRowModel, type SortingState, type ColumnFiltersState, type ExpandedState, type GroupingState, type Row } from '@tanstack/react-table';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Table, TableBody, TableHeader, TableRow, TablePagination } from '@/components/ui/components/Table';
import { cn } from '@/utils/utils';
import { multiSelectFilterFn, fuzzyArrayIncludesFilterFn } from '@/components/ui/utils/tableFilter';
import type { DataTableExtendedProps } from './types';
import { createSelectionColumn } from './createSelectionColumn';
import { createRowActionsColumn } from './createRowActionsColumn';
import { DraggableColumn, ActiveHeaderOverlay } from './DraggableColumn';
import { SkeletonRow } from './SkeletonRow';
import { EmptyDataRow } from './EmptyDataRow';
import { DataTableRow } from './DataTableRow';
import { useDraggableColumnOrder } from './useDraggableColumnOrder';

type RowSelectionState = Record<string, boolean>;

const DEFAULT_SKELETON_ROWS = 5;

function normalizeRowSelection(selection: RowSelectionState): RowSelectionState {
  const normalized: RowSelectionState = {};
  Object.entries(selection).forEach(([key, value]) => {
    if (value) {
      normalized[key] = true;
    }
  });
  return normalized;
}

function areRowSelectionsEqual(a: RowSelectionState, b: RowSelectionState): boolean {
  if (a === b) return true;

  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key, index) => key === bKeys[index] && a[key] === b[key]);
}

export function DataTableExtended<TData, TValue>({
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
  enableGrouping = false,
  grouping,
  onGroupingChange,
  expanded,
  onExpandedChange,
  onColumnOrderChange,
  rowActions,
}: DataTableExtendedProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [internalGrouping, setInternalGrouping] = useState<GroupingState>([]);
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});
  const [isInteractive, setIsInteractive] = useState(false);

  const resolvedRowSelection = useMemo(() => {
    return rowSelection ? normalizeRowSelection(rowSelection) : internalRowSelection;
  }, [rowSelection, internalRowSelection]);

  const resolvedGrouping = useMemo(() => {
    if (!enableGrouping) {
      return [] as GroupingState;
    }
    return grouping ?? internalGrouping;
  }, [enableGrouping, grouping, internalGrouping]);

  const resolvedExpanded = useMemo(
    () => expanded ?? internalExpanded,
    [expanded, internalExpanded]
  );

  const hasActiveGrouping = useMemo(
    () => enableGrouping && resolvedGrouping.length > 0,
    [enableGrouping, resolvedGrouping]
  );

  const selectionEnabled = showCheckbox || enableRowClickSelection;

  const canSelectRow = useCallback((row: Row<TData>) => {
    if (!selectionEnabled) {
      return false;
    }
    return hasActiveGrouping ? row.getIsGrouped() : true;
  }, [hasActiveGrouping, selectionEnabled]);

  const effectiveColumns = useMemo(() => {
    const nextColumns = [...columns];

    if (showCheckbox) {
      nextColumns.unshift(
        createSelectionColumn<TData, TValue>({ isGroupingEnabled: hasActiveGrouping })
      );
    }

    if (rowActions?.length) {
      nextColumns.push(createRowActionsColumn<TData, TValue>(rowActions));
    }

    return nextColumns;
  }, [columns, hasActiveGrouping, rowActions, showCheckbox]);

  const {
    columnOrder,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    overId,
    setColumnOrder,
  } = useDraggableColumnOrder({
    columns: effectiveColumns,
    onOrderChange: onColumnOrderChange,
  });

  useEffect(() => {
    setIsInteractive(true);
  }, []);

  const consumerExternalPagination =
    totalCount !== undefined && currentPage !== undefined && pageSize !== undefined;

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    enableRowSelection: canSelectRow,
    autoResetPageIndex: isInteractive,
    onColumnOrderChange: setColumnOrder,
    filterFromLeafRows: true,
    getCoreRowModel: getCoreRowModel(),
    ...(showPagination && !consumerExternalPagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    ...(enableGrouping && {
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
    }),
    onSortingChange: (updaterOrValue) => {
      setSorting((previous) =>
        typeof updaterOrValue === 'function'
          ? (updaterOrValue as (prev: SortingState) => SortingState)(previous)
          : updaterOrValue
      );
    },
    onColumnFiltersChange: (updaterOrValue) => {
      setColumnFilters((previous) =>
        typeof updaterOrValue === 'function'
          ? (updaterOrValue as (prev: ColumnFiltersState) => ColumnFiltersState)(previous)
          : updaterOrValue
      );
    },
    onRowSelectionChange: (updaterOrValue) => {
      const nextSelection = normalizeRowSelection(
        typeof updaterOrValue === 'function'
          ? (updaterOrValue as (prev: RowSelectionState) => RowSelectionState)(resolvedRowSelection)
          : updaterOrValue
      );

      if (!rowSelection) {
        setInternalRowSelection((previous) =>
          areRowSelectionsEqual(previous, nextSelection) ? previous : nextSelection
        );
      }

      if (!onRowSelectionChange || areRowSelectionsEqual(resolvedRowSelection, nextSelection)) {
        return;
      }

      const rowsById = table.getRowModel().rowsById;
      const selectedRowIds = Object.keys(nextSelection);
      const selectedRows = selectedRowIds
        .map((id) => rowsById[id])
        .filter((row): row is typeof rowsById[string] => Boolean(row))
        .map((row) => row.original);

      onRowSelectionChange(selectedRows, selectedRowIds);
    },
    onGroupingChange: enableGrouping
      ? (updaterOrValue) => {
          const nextGrouping =
            typeof updaterOrValue === 'function'
              ? (updaterOrValue as (prev: GroupingState) => GroupingState)(resolvedGrouping)
              : updaterOrValue;

          if (!grouping) {
            setInternalGrouping(nextGrouping);
          }

          if (onGroupingChange) {
            onGroupingChange(nextGrouping);
          }
        }
      : undefined,
    onExpandedChange: (updaterOrValue) => {
      const nextExpanded =
        typeof updaterOrValue === 'function'
          ? (updaterOrValue as (prev: ExpandedState) => ExpandedState)(resolvedExpanded)
          : updaterOrValue;

      if (!expanded) {
        setInternalExpanded(nextExpanded);
      }

      if (onExpandedChange) {
        onExpandedChange(nextExpanded);
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
      rowSelection: resolvedRowSelection,
      ...(enableGrouping && { grouping: resolvedGrouping }),
      expanded: resolvedExpanded,
      columnOrder,
    },
    initialState: {
      pagination: {
        pageSize: showPagination ? 10 : 999999,
      },
    },
  });

  const paginationProps = (() => {
    const base: {
      table?: typeof table;
      totalCount?: number;
      currentPage?: number;
      pageSize?: number;
      onPageChange?: (page: number) => void;
      onPageSizeChange?: (size: number) => void;
      selectedCount?: number;
    } = {};

    if (consumerExternalPagination) {
      base.totalCount = totalCount;
      base.currentPage = currentPage;
      base.pageSize = pageSize;
      base.onPageChange = onPageChange;
      base.onPageSizeChange = onPageSizeChange;
      base.selectedCount = selectedCount;
      return base;
    }

    if (hasActiveGrouping) {
      const rows = table.getRowModel().rows;
      base.totalCount = rows.filter((row) => row.getIsGrouped()).length;
      base.currentPage = table.getState().pagination.pageIndex;
      base.pageSize = table.getState().pagination.pageSize;
      base.onPageChange = (page: number) => {
        table.setPageIndex(page);
      };
      base.onPageSizeChange = (size: number) => {
        table.setPageSize(size);
      };
      base.selectedCount = rows.filter((row) => row.getIsGrouped() && row.getIsSelected()).length;
      return base;
    }

    base.table = table;
    return base;
  })();

  return (
    <div className="flex flex-col h-full">
      <div className={cn('flex-1 rounded-md border border-outlineVariant overflow-auto', className)}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <Table style={{ width: '100%', height: '100%' }}>
            <TableHeader>
              <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                {table.getHeaderGroups().map((headerGroup) => {
                  const sortedHeaders = [...headerGroup.headers].sort((a, b) => {
                    const indexA = columnOrder.indexOf(a.column.id);
                    const indexB = columnOrder.indexOf(b.column.id);
                    return indexA - indexB;
                  });
                  const totalHeaders = sortedHeaders.length;
                  
                  return (
                    <TableRow key={headerGroup.id} className="hover:bg-tertiaryContainer/80">
                      {sortedHeaders.map((header, index) => (
                        <DraggableColumn 
                          key={header.id} 
                          header={header} 
                          index={index}
                          totalHeaders={totalHeaders}
                          activeId={activeId}
                          overId={overId}
                        />
                      ))}
                    </TableRow>
                  );
                })}
              </SortableContext>
            </TableHeader>
            
            <TableBody>
              {isLoading ? (
                <SkeletonRow columns={effectiveColumns} rowCount={DEFAULT_SKELETON_ROWS} />
              ) : table.getRowModel().rows.length ? (
                <DataTableRow
                  table={table}
                  enableRowClickSelection={enableRowClickSelection}
                  columnOrder={columnOrder}
                />
              ) : (
                <EmptyDataRow columnLength={effectiveColumns.length} />
              )}
            </TableBody>
          </Table>
          <ActiveHeaderOverlay headerId={activeId} table={table} />
        </DndContext>
      </div>
      
      {showPagination && (
        <TablePagination
          table={paginationProps.table}
          totalCount={paginationProps.totalCount}
          currentPage={paginationProps.currentPage}
          pageSize={paginationProps.pageSize}
          onPageChange={paginationProps.onPageChange}
          onPageSizeChange={paginationProps.onPageSizeChange}
          selectedCount={paginationProps.selectedCount}
        />
      )}
    </div>
  );
}

// Re-export the original DataTable for convenience
export { DataTable } from '@/components/ui/components/Table';
