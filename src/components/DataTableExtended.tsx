/**
 * DataTableExtended - Extended wrapper for DataTable with onRowDoubleClick support
 * 
 * This component extends the original DataTable from the UI submodule
 * with additional functionality without modifying the submodule code.
 * 
 * Note: Since we cannot modify the submodule's DataTable directly, this wrapper
 * uses DOM event delegation to add double-click functionality.
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

import { useEffect, useRef } from 'react';
import { DataTable } from '@/components/ui/components/Table';
import type { ColumnDef } from '@tanstack/react-table';
import type { CustomColumnDef } from '@/components/ui/utils/dataTable';

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
  ...props
}: DataTableExtendedProps<TData, TValue>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onRowDoubleClick) return;
    
    const container = containerRef.current;
    if (!container) return;

    const handleDoubleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Find the closest table row
      const row = target.closest('tbody tr');
      if (!row) return;

      // Check if the click is on an interactive element
      const isInteractiveElement = target.closest(
        'button, a, input, select, textarea, [role="button"], [role="checkbox"]'
      );
      if (isInteractiveElement) return;

      // Get the row index from the table
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

  // Add cursor pointer style when onRowDoubleClick is provided
  const enhancedClassName = onRowDoubleClick
    ? `${props.className ?? ''} [&_tbody_tr]:cursor-pointer`
    : props.className;

  return (
    <div ref={containerRef}>
      <DataTable
        {...props}
        data={data}
        className={enhancedClassName}
      />
    </div>
  );
}

// Re-export the original DataTable as well for convenience
export { DataTable } from '@/components/ui/components/Table';
