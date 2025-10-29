/**
 * DataTableExtended - Extended wrapper for DataTable with additional features
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { 
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getExpandedRowModel,
  getGroupedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type ExpandedState,
  type GroupingState,
  type Table as TanStackTable,
  type Header,
  type Row,
} from '@tanstack/react-table';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOverlay } from '@dnd-kit/core';
import { Skeleton, Option } from '@/components/ui/components';
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

  // Grouping props
  enableGrouping?: boolean;
  grouping?: GroupingState;
  onGroupingChange?: (grouping: GroupingState) => void;
  expanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;
  onColumnOrderChange?: (columnOrder: string[]) => void;
}

type ColumnDefWithHeaderAlign<TData, TValue> = ColumnDef<TData, TValue> & {
  headerAlign?: 'right';
};

function hasHeaderAlign<TData, TValue>(
  columnDef: ColumnDef<TData, TValue>
): columnDef is ColumnDefWithHeaderAlign<TData, TValue> {
  return 'headerAlign' in columnDef;
}

function resolveColumnId<TData, TValue>(
  column: ColumnDef<TData, TValue> | CustomColumnDef<TData, TValue>,
  index: number
): string {
  if (column.id) {
    return column.id;
  }

  if ('accessorKey' in column && column.accessorKey) {
    return String(column.accessorKey);
  }

  return `col-${index.toString()}`;
}

// Draggable header component
function DraggableHeader<TData, TValue>({
  header,
  index,
  totalHeaders,
  activeId,
  overId,
}: {
  header: Header<TData, TValue>;
  index: number;
  totalHeaders: number;
  activeId: string | null;
  overId: string | null;
}) {
  const isSelectionColumn = header.column.id === 'select';
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
    disabled: isSelectionColumn, // Disable sorting for selection column
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (header.isPlaceholder) {
    return (
      <TableHead ref={setNodeRef} style={style} className="w-0">
        <div className="w-0 h-0" />
      </TableHead>
    );
  }

  const headerContent = (
    <div className="flex items-center gap-2">
      <div
        onClick={(e) => {
          e.stopPropagation();
          header.column.getToggleSortingHandler()?.(e);
        }}
        className={cn('flex items-center gap-2 w-full justify-between select-none', {
          'cursor-pointer': header.column.getCanSort(),
          'justify-end': hasHeaderAlign(header.column.columnDef) && header.column.columnDef.headerAlign === 'right',
        })}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
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
  );

  const isActive = header.column.id === activeId;
  const isOver = header.column.id === overId && !isActive;

  if (isSelectionColumn) {
    return (
      <TableHead
        className={cn('relative', {
          'rounded-tl-md': index === 0,
          'rounded-tr-md': index === totalHeaders - 1,
        })}
      >
        {headerContent}
      </TableHead>
    );
  }

  return (
    <TableHead
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}  // Apply listeners directly to TableHead for drag without visible handle
      className={cn('relative group', {
        'rounded-tl-md': index === 0,
        'rounded-tr-md': index === totalHeaders - 1,
        'opacity-50': isDragging,
        'cursor-grab': !isDragging,  // Subtle cursor change on hover to indicate draggability
        'cursor-grabbing': isDragging,
        // Drop zone highlight
        'border-2 border-primary bg-primary/10 rounded': isOver,
      })}
    >
      {headerContent}
    </TableHead>
  );
}

// Drag Overlay for active header (moved to top-level)
function ActiveHeaderOverlay<TData>({
  headerId,
  table,
}: {
  headerId: string | null;
  table: TanStackTable<TData>;
}) {
  if (!headerId) return null;

  const activeHeader = table.getHeaderGroups()[0]?.headers.find(h => h.column.id === headerId);
  if (!activeHeader) return null;

  return (
    <DragOverlay>
      <div className="flex items-center gap-2 bg-surfaceContainer px-3 py-2 rounded-md shadow-lg border">
        <div className="flex items-center gap-2">
          {flexRender(activeHeader.column.columnDef.header, activeHeader.getContext())}
          <CaretUpDown className="w-4 h-4 text-onSurfaceVariant" />
        </div>
      </div>
    </DragOverlay>
  );
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
  enableGrouping = false,
  grouping,
  onGroupingChange,
  expanded,
  onExpandedChange,
  onColumnOrderChange,
}: DataTableExtendedProps<TData, TValue>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<Record<string, boolean>>({});
  const [internalGrouping, setInternalGrouping] = useState<GroupingState>([]);
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});
  
  const currentRowSelection = rowSelection ?? internalRowSelection;
  const currentGrouping = grouping ?? internalGrouping;
  const currentExpanded = expanded ?? internalExpanded;

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Compute effective columns first (including selection column if enabled)
  const effectiveColumns = useMemo(() => {
    if (showCheckbox) {
      const isGroupingEnabled = enableGrouping && currentGrouping.length > 0;
      
      // Create custom selection column that respects grouping
      const customSelectionColumn: ColumnDef<TData, TValue> = {
        id: "select",
        meta: { order: 0 }, // Ensure selection column is always first
        header: ({ table }) => {
          if (isGroupingEnabled) {
            // Custom logic for grouping mode - only consider group rows
            const allGroupRows = table.getRowModel().rows.filter(row => row.getIsGrouped());
            const allSelected = allGroupRows.length > 0 && allGroupRows.every(row => row.getIsSelected());
            const someSelected = allGroupRows.some(row => row.getIsSelected());
            
            const handleToggleAll = () => {
              // Use table.setRowSelection to update all group rows at once
              if (allSelected) {
                // Deselect all group rows
                const deselectedState: Record<string, boolean> = {};
                allGroupRows.forEach(row => {
                  deselectedState[row.id] = false;
                });
                table.setRowSelection(deselectedState);
              } else {
                // Select all group rows
                const selectedState: Record<string, boolean> = {};
                allGroupRows.forEach(row => {
                  selectedState[row.id] = true;
                });
                table.setRowSelection(selectedState);
              }
            };
            
            return (
              <div className="flex items-center gap-4">
                <Option
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onChange={handleToggleAll}
                />
              </div>
            );
          } else {
            // Use standard TanStack Table behavior for non-grouping mode
            return (
              <div className="flex items-center gap-4">
                <Option
                  checked={table.getIsAllRowsSelected()}
                  indeterminate={table.getIsSomeRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                />
              </div>
            );
          }
        },
        cell: ({ row }) => {
          // In grouping mode, disable selection for leaf rows
          const canSelect = isGroupingEnabled ? row.getIsGrouped() : row.getCanSelect();
          
          const handleToggle = () => {
            // In grouping mode, only allow toggling group rows
            if (isGroupingEnabled && !row.getIsGrouped()) {
              return;
            }
            row.toggleSelected();
          };
          
          return (
            <div 
              className="flex items-center gap-4"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Option
                checked={row.getIsSelected()}
                disabled={!canSelect}
                onChange={handleToggle}
              />
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
        size: 1,
      };
      
      return [customSelectionColumn, ...columns];
    }
    return columns;
  }, [columns, showCheckbox, enableGrouping, currentGrouping]);
  
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const columnIds = effectiveColumns.map((col, index) => resolveColumnId(col, index));
    // Ensure selection column is first in initial order
    const selectionIndex = columnIds.indexOf('select');
    if (selectionIndex > 0) {
      const [selectionColumn] = columnIds.splice(selectionIndex, 1);
      return [selectionColumn, ...columnIds];
    }
    return columnIds;
  });
  
  // DnD state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);  // Add back for drop indicator

  // Determine if consumer provided external pagination props
  const consumerExternalPagination =
    totalCount !== undefined && currentPage !== undefined && pageSize !== undefined;
  // Grouping active implies we want to drive the pagination footer via external props
  const groupingActive = enableGrouping && currentGrouping.length > 0;
  const useExternalPagination = consumerExternalPagination || groupingActive;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,  // Short delay for clicks vs drags
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reordering logic
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    setOverId(null);  // Reset on start
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over?.id !== activeId) {
      setOverId(over?.id as string || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      setColumnOrder((previousOrder) => {
        // Prevent selection column from being moved
        if (active.id === 'select' || over.id === 'select') {
          return previousOrder;
        }

        const oldIndex = previousOrder.indexOf(active.id as string);
        const newIndex = previousOrder.indexOf(over.id as string);

        if (oldIndex === -1 || newIndex === -1) {
          return previousOrder;
        }

        const newOrder = arrayMove(previousOrder, oldIndex, newIndex);
        
        // Ensure selection column stays first
        const selectionIndex = newOrder.indexOf('select');
        if (selectionIndex > 0) {
          const [selectionColumn] = newOrder.splice(selectionIndex, 1);
          return [selectionColumn, ...newOrder];
        }

        return newOrder;
      });
    }

    setActiveId(null);
    setOverId(null);
  };

  // Create table instance with faceted filtering support
  const table = useReactTable({
    data,
    columns: effectiveColumns,  // Use effective columns here
    enableRowSelection: showCheckbox || enableRowClickSelection,
    onColumnOrderChange: (updaterOrValue) => {
      if (isMountedRef.current) {
        setColumnOrder(updaterOrValue as any);
      } else {
        setTimeout(() => {
          if (isMountedRef.current) {
            setColumnOrder(updaterOrValue as any);
          }
        }, 0);
      }
    },
    filterFromLeafRows: true,
    getCoreRowModel: getCoreRowModel(),
    
    // Keep internal pagination when consumer did NOT provide external pagination.
    // For grouping-driven external footer we still rely on internal pagination underneath.
    ...(showPagination && !consumerExternalPagination && {
      getPaginationRowModel: getPaginationRowModel(),
    }),

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Add faceted filtering support
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    // Add grouping support
    ...(enableGrouping && {
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
    }),
    
    onSortingChange: (updaterOrValue) => {
      if (isMountedRef.current) {
        setSorting(updaterOrValue as any);
      } else {
        setTimeout(() => {
          if (isMountedRef.current) {
            setSorting(updaterOrValue as any);
          }
        }, 0);
      }
    },
    onColumnFiltersChange: (updaterOrValue) => {
      if (isMountedRef.current) {
        setColumnFilters(updaterOrValue as any);
      } else {
        setTimeout(() => {
          if (isMountedRef.current) {
            setColumnFilters(updaterOrValue as any);
          }
        }, 0);
      }
    },
    onRowSelectionChange: (updaterOrValue) => {
      const newSelection =
        typeof updaterOrValue === 'function' ? updaterOrValue(currentRowSelection) : updaterOrValue;

      // In grouping mode, filter out leaf rows from the selection state as a safety measure
      const isGroupingEnabled = enableGrouping && currentGrouping.length > 0;
      let filteredSelection = newSelection;
      
      if (isGroupingEnabled) {
        // Only keep group rows in the selection state
        filteredSelection = Object.keys(newSelection).reduce<Record<string, boolean>>((acc, key) => {
          try {
            const row = table.getRow(key);
            // Only include group rows in the selection state
            if (row.getIsGrouped() && newSelection[key]) {
              acc[key] = true;
            }
          } catch {
            // Row not found, skip it
          }
          return acc;
        }, {});
      }

      if (!rowSelection) {
        if (isMountedRef.current) {
          setInternalRowSelection(filteredSelection);
        } else {
          setTimeout(() => {
            if (isMountedRef.current) {
              setInternalRowSelection(filteredSelection);
            }
          }, 0);
        }
      }

      if (onRowSelectionChange && isMountedRef.current) {
        const selectedRowIds = Object.keys(filteredSelection).filter((key) => filteredSelection[key]);
        
        // Map to selected rows (already filtered to group rows only if grouping is enabled)
        const selectedRows = selectedRowIds
          .map((id) => table.getRow(id))
          .map((row) => row.original);
        
        // Defer the callback to ensure it runs after mount
        setTimeout(() => {
          if (isMountedRef.current) {
            onRowSelectionChange(selectedRows, selectedRowIds);
          }
        }, 0);
      }
    },
    onGroupingChange: (updaterOrValue) => {
      const newGrouping =
        typeof updaterOrValue === 'function' ? updaterOrValue(currentGrouping) : updaterOrValue;

      if (!grouping) {
        if (isMountedRef.current) {
          setInternalGrouping(newGrouping);
        } else {
          setTimeout(() => {
            if (isMountedRef.current) {
              setInternalGrouping(newGrouping);
            }
          }, 0);
        }
      }

      if (onGroupingChange) {
        onGroupingChange(newGrouping);
      }
    },
    onExpandedChange: (updaterOrValue) => {
      const newExpanded =
        typeof updaterOrValue === 'function' ? updaterOrValue(currentExpanded) : updaterOrValue;

      if (!expanded) {
        if (isMountedRef.current) {
          setInternalExpanded(newExpanded);
        } else {
          setTimeout(() => {
            if (isMountedRef.current) {
              setInternalExpanded(newExpanded);
            }
          }, 0);
        }
      }

      if (onExpandedChange) {
        onExpandedChange(newExpanded);
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
      ...(enableGrouping && {
        grouping: currentGrouping,
        expanded: currentExpanded,
      }),
      columnOrder,
    },
    initialState: {
      pagination: {
        pageSize: showPagination ? 10 : 999999,
      },
    },
  });

  useEffect(() => {
    const effectiveColumnIds = effectiveColumns.map((col, index) => resolveColumnId(col, index));

    setColumnOrder((previousOrder) => {
      // Ensure selection column is always first
      const selectionColumnId = effectiveColumnIds.find(id => id === 'select');
      const otherColumnIds = effectiveColumnIds.filter(id => id !== 'select');
      
      // Check if we have a significant change that warrants a complete reset
      // (e.g., switching between batch and asset modes)
      const hasSelectionColumnInPrevious = previousOrder.includes('select');
      const currentHasSelectionColumn = !!selectionColumnId;
      const columnCountChanged = effectiveColumnIds.length !== previousOrder.length;
      
      // If selection column status changed or column count changed significantly, reset order
      if ((hasSelectionColumnInPrevious !== currentHasSelectionColumn) || 
          columnCountChanged) {
        // Complete reset: selection first, then other columns in their natural order
        return selectionColumnId 
          ? [selectionColumnId, ...otherColumnIds]
          : [...otherColumnIds];
      }
      
      // Otherwise, try to preserve order
      const filtered = previousOrder.filter((id) => effectiveColumnIds.includes(id) && id !== 'select');
      const additions = otherColumnIds.filter((id) => !filtered.includes(id));
      const nextOrder = selectionColumnId 
        ? [selectionColumnId, ...filtered, ...additions]
        : [...filtered, ...additions];

      const sameLength = nextOrder.length === previousOrder.length;
      if (sameLength && nextOrder.every((id, idx) => id === previousOrder[idx])) {
        return previousOrder;
      }

      return nextOrder;
    });
  }, [effectiveColumns, enableGrouping]);

  useEffect(() => {
    if (onColumnOrderChange) {
      onColumnOrderChange(columnOrder);
    }
  }, [columnOrder, onColumnOrderChange]);

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

      // Find the row in the table's current row model
      const tableRows = table.getRowModel().rows;
      const clickedRow = tableRows.find(r => r.id === row.getAttribute('data-row-id'));
      
      if (clickedRow) {
        onRowDoubleClick(clickedRow.original);
      }
    };

    container.addEventListener('dblclick', handleDoubleClick as EventListener);
    return () => {
      container.removeEventListener('dblclick', handleDoubleClick as EventListener);
    };
  }, [onRowDoubleClick, table]);

  const enhancedClassName = onRowDoubleClick
    ? `${className ?? ''} [&_tbody_tr]:cursor-pointer`
    : className;

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <div className={cn('flex-1 rounded-md border border-outlineVariant', enhancedClassName)}>
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
                  const totalHeaders = headerGroup.headers.length;
                  // Sort headers according to columnOrder
                  const sortedHeaders = headerGroup.headers.sort((a, b) => {
                    const indexA = columnOrder.indexOf(a.column.id);
                    const indexB = columnOrder.indexOf(b.column.id);
                    return indexA - indexB;
                  });
                  return (
                    <TableRow key={headerGroup.id} className="hover:bg-tertiaryContainer/80">
                      {sortedHeaders.map((header, index) => (
                        <DraggableHeader 
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
                <SkeletonRow columns={columns} rowCount={5} />
              ) : table.getRowModel().rows.length ? (
                <DataTableRow
                  table={table}
                  enableRowClickSelection={enableRowClickSelection}
                  columnOrder={columnOrder}
                />
              ) : (
                <EmptyDataRow columnLength={columns.length} />
              )}
            </TableBody>
          </Table>
          <ActiveHeaderOverlay headerId={activeId} table={table} />
        </DndContext>
      </div>
      
      {showPagination && (
        <TablePagination
          table={useExternalPagination ? undefined : table}
          totalCount={
            consumerExternalPagination
              ? (totalCount as number)
              : groupingActive
                ? table.getRowModel().rows.filter((r) => r.getIsGrouped()).length
                : undefined
          }
          currentPage={
            consumerExternalPagination
              ? (currentPage as number)
              : groupingActive
                ? table.getState().pagination.pageIndex
                : undefined
          }
          pageSize={
            consumerExternalPagination
              ? (pageSize as number)
              : groupingActive
                ? table.getState().pagination.pageSize
                : undefined
          }
          onPageChange={
            consumerExternalPagination
              ? onPageChange
              : groupingActive
                ? (page: number) => table.setPageIndex(page)
                : undefined
          }
          onPageSizeChange={
            consumerExternalPagination
              ? onPageSizeChange
              : groupingActive
                ? (size: number) => table.setPageSize(size)
                : undefined
          }
          selectedCount={
            consumerExternalPagination
              ? selectedCount
              : groupingActive
                ? table
                    .getRowModel()
                    .rows.filter((r) => r.getIsGrouped() && r.getIsSelected()).length
                : undefined
          }
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
  columnOrder,
}: {
  table: TanStackTable<TData>;
  enableRowClickSelection?: boolean;
  columnOrder: string[];
}) {
  const handleRowClick = (row: Row<TData>, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInteractiveElement = target.closest(
      'button, a, input, select, textarea, [role="button"]'
    );
    const groupingActive = Array.isArray((table.getState() as any)?.grouping) && (table.getState() as any).grouping.length > 0;

    // Prioritize selection on row click when enabled
    if (
      enableRowClickSelection &&
      !isInteractiveElement &&
      row.getCanSelect() &&
      (!groupingActive || row.getIsGrouped())
    ) {
      event.preventDefault();
      row.toggleSelected();
      return;
    }

    // Fallback: expand/collapse grouped rows when clicking non-interactive area
    if (row.getIsGrouped() && !isInteractiveElement) {
      event.preventDefault();
      row.getToggleExpandedHandler()();
      return;
    }
  };

  return (
    <>
      {table.getRowModel().rows.map((row, index) => {
        const isLastRow = index === table.getRowModel().rows.length - 1;
        const cells = row.getVisibleCells();
        
        // Sort cells according to columnOrder
        const sortedCells = cells.sort((a, b) => {
          const indexA = columnOrder.indexOf(a.column.id);
          const indexB = columnOrder.indexOf(b.column.id);
          return indexA - indexB;
        });

        return (
          <TableRow
            key={row.id}
            data-row-id={row.id}
            data-state={row.getIsSelected() && 'selected'}
            onClick={(event) => { handleRowClick(row, event); }}
            className={cn(
              enableRowClickSelection && row.getCanSelect() && 'cursor-pointer',
              row.getIsGrouped() && 'font-semibold cursor-pointer'
            )}
          >
            {sortedCells.map((cell, i) => (
              <TableCell
                key={cell.id}
                className={cn({
                  'rounded-bl-md': isLastRow && i === 0,
                  'rounded-br-md': isLastRow && i === sortedCells.length - 1,
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
