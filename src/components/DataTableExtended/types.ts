import type { ColumnDef } from '@tanstack/react-table';
import type { CustomColumnDef } from '@/components/ui/utils/dataTable';

export type DataTableColumn<TData, TValue> =
  | ColumnDef<TData, TValue>
  | CustomColumnDef<TData, TValue>;
