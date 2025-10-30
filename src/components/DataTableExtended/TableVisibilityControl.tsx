import { memo } from 'react';
import { TableColumnVisibility } from '@/components/ui/components/Table';
import type { SetStateAction } from 'react';
import type { DataTableColumn } from './types';

interface TableVisibilityControlProps<TData, TValue> {
  columns: DataTableColumn<TData, TValue>[];
  visibleColumns: DataTableColumn<TData, TValue>[];
  setVisibleColumns: (updater: SetStateAction<DataTableColumn<TData, TValue>[]>) => void;
}

function TableVisibilityControlComponent<TData, TValue>(
  props: TableVisibilityControlProps<TData, TValue>
) {
  const { columns, visibleColumns, setVisibleColumns } = props;

  return (
    <TableColumnVisibility
      columns={columns}
      visibleColumns={visibleColumns}
      setVisibleColumns={setVisibleColumns}
    />
  );
}

export const TableVisibilityControl = memo(TableVisibilityControlComponent) as typeof TableVisibilityControlComponent;
