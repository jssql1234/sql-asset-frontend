/**
 * DraggableColumn component for column reordering
 */

import { useMemo } from 'react';
import { flexRender, type Header, type Table as TanStackTable } from '@tanstack/react-table';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragOverlay } from '@dnd-kit/core';
import { cn } from '@/utils/utils';
import { TableHead, MemoizedTableFilter } from '@/components/ui/components/Table';
import { CaretUpFilled, CaretDownFilled, CaretUpDown } from '@/assets/icons';

/**
 * SortIndicator component for table headers
 */
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

/**
 * Type guard for column definitions with header alignment
 */
function hasHeaderAlign<TData, TValue>(
  columnDef: import('@tanstack/react-table').ColumnDef<TData, TValue>
): columnDef is import('@tanstack/react-table').ColumnDef<TData, TValue> & { headerAlign?: 'right' } {
  return 'headerAlign' in columnDef;
}

interface DraggableColumnProps<TData, TValue> {
  header: Header<TData, TValue>;
  index: number;
  totalHeaders: number;
  activeId: string | null;
  overId: string | null;
}

export function DraggableColumn<TData, TValue>({
  header,
  index,
  totalHeaders,
  activeId,
  overId,
}: DraggableColumnProps<TData, TValue>) {
  const isSelectionColumn = header.column.id === 'select';
  const isRowActionsColumn = header.column.id === 'row-actions';
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: header.column.id,
    disabled: isSelectionColumn || isRowActionsColumn,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const filterOptions = useMemo(() => {
    if (!header.column.getCanFilter()) {
      return [] as string[];
    }

    const values = header.column.getFacetedUniqueValues();
    const unique = new Set<string>();

    values.forEach((_, key) => {
      if (Array.isArray(key)) {
        key.forEach((item) => unique.add(String(item)));
        return;
      }

      if (typeof key === 'string') {
        key
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
          .forEach((item) => unique.add(item));
        return;
      }

      unique.add(String(key));
    });

    return Array.from(unique);
  }, [header.column]);

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
          uniqueValues={filterOptions}
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
      {...listeners}
      className={cn('relative group', {
        'rounded-tl-md': index === 0,
        'rounded-tr-md': index === totalHeaders - 1,
        'opacity-50': isDragging,
        'cursor-grab': !isDragging,
        'cursor-grabbing': isDragging,
        // Drop zone highlight
        'border-2 border-primary bg-primary/10 rounded': isOver,
      })}
    >
      {headerContent}
    </TableHead>
  );
}

//ActiveHeaderOverlay component for drag preview
interface ActiveHeaderOverlayProps<TData> {
  headerId: string | null;
  table: TanStackTable<TData>;
}

export function ActiveHeaderOverlay<TData>({
  headerId,
  table,
}: ActiveHeaderOverlayProps<TData>) {
  if (!headerId) return null;

  const activeHeader = table
    .getHeaderGroups()
    .flatMap((group) => group.headers)
    .find((header) => header.column.id === headerId);
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
