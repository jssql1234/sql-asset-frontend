/**
 * DataTableExtended - Extended wrapper for DataTable with additional features
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

  // Grouping props
  enableGrouping?: boolean;
  grouping?: GroupingState;
  onGroupingChange?: (grouping: GroupingState) => void;
  expanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;
}

type ColumnDefWithHeaderAlign<TData, TValue> = ColumnDef<TData, TValue> & {
  headerAlign?: 'right';
};

function hasHeaderAlign<TData, TValue>(
  columnDef: ColumnDef<TData, TValue>
): columnDef is ColumnDefWithHeaderAlign<TData, TValue> {
  return 'headerAlign' in columnDef;
}

// Draggable header component (moved to top-level)
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
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
          e.stopPropagation();  // Prevent DnD interference
          header.column.getToggleSortingHandler()?.(e);
        }}
        className={cn('flex items-center gap-2 w-full justify-between select-none', {  // Ensure select-none
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
}: DataTableExtendedProps<TData, TValue>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<Record<string, boolean>>({});
  const [internalGrouping, setInternalGrouping] = useState<GroupingState>([]);
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});
  
  // Column ordering state - safer initialization
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    return columns.map((col, index) => {
      if (col.id) return col.id;
      // Check if accessorKey exists as a property
      if ('accessorKey' in col && col.accessorKey) {
        return String(col.accessorKey);
      }
      return `col-${index.toString()}`;
    });
  });
  
  // DnD state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);  // Add back for drop indicator

  const currentRowSelection = rowSelection ?? internalRowSelection;
  const currentGrouping = grouping ?? internalGrouping;
  const currentExpanded = expanded ?? internalExpanded;
  const isExternalPagination = totalCount !== undefined && currentPage !== undefined && pageSize !== undefined;

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
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
      }
    }
    
    setActiveId(null);
    setOverId(null);
  };

  // Create table instance with faceted filtering support
  const table = useReactTable({
    data,
    columns: showCheckbox ? [createSelectionColumn<TData, TValue>(), ...columns] : columns,
    enableRowSelection: showCheckbox || enableRowClickSelection,
    onColumnOrderChange: setColumnOrder,
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
    // Add grouping support
    ...(enableGrouping && {
      getGroupedRowModel: getGroupedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
    }),
    
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
    onGroupingChange: (updaterOrValue) => {
      const newGrouping =
        typeof updaterOrValue === 'function' ? updaterOrValue(currentGrouping) : updaterOrValue;

      if (!grouping) {
        setInternalGrouping(newGrouping);
      }

      if (onGroupingChange) {
        onGroupingChange(newGrouping);
      }
    },
    onExpandedChange: (updaterOrValue) => {
      const newExpanded =
        typeof updaterOrValue === 'function' ? updaterOrValue(currentExpanded) : updaterOrValue;

      if (!expanded) {
        setInternalExpanded(newExpanded);
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={cn('flex-1 rounded-md border border-outlineVariant', enhancedClassName)}>
          <Table style={{ width: '100%', height: '100%' }}>
            <TableHeader>
              <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                {table.getHeaderGroups().map((headerGroup) => {
                  const totalHeaders = headerGroup.headers.length;
                  return (
                    <TableRow key={headerGroup.id} className="hover:bg-tertiaryContainer/80">
                      {headerGroup.headers.map((header, index) => (
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
                />
              ) : (
                <EmptyDataRow columnLength={columns.length} />
              )}
            </TableBody>
          </Table>
        </div>
        <ActiveHeaderOverlay headerId={activeId} table={table} />
      </DndContext>
      
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

    // Handle grouped row expansion/collapse
    if (row.getIsGrouped() && !isInteractiveElement) {
      event.preventDefault();
      row.getToggleExpandedHandler()();
      return;
    }

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
            data-row-id={row.id}
            data-state={row.getIsSelected() && 'selected'}
            onClick={(event) => { handleRowClick(row, event); }}
            className={cn(
              enableRowClickSelection && row.getCanSelect() && 'cursor-pointer',
              row.getIsGrouped() && 'bg-surfaceContainerLowest font-semibold cursor-pointer hover:bg-surfaceContainerLowest/80'
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
