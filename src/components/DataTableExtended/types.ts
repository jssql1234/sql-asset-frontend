/**
 * Type definitions for DataTableExtended component
 */

import type { ColumnDef, ExpandedState, GroupingState } from '@tanstack/react-table';
import type { CustomColumnDef } from '@/components/ui/utils/dataTable';

// Row action types
export type RowActionType = 'view' | 'edit' | 'delete' | 'custom';

// Row action configuration
export interface RowAction<TData> {
  type: RowActionType;
  id?: string;
  label?: string;
  onClick: (row: TData) => void;
  icon?: React.ComponentType<{ className?: string }>;
}

// Main DataTableExtended props
export interface DataTableExtendedProps<TData, TValue> {
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

  // Row actions dropdown
  rowActions?: RowAction<TData>[];

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

// Column definition with header alignment
export type ColumnDefWithHeaderAlign<TData, TValue> = ColumnDef<TData, TValue> & {
  headerAlign?: 'right';
};
