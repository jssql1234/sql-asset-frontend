/**
 * SkeletonRow component for loading states
 */

import type { ColumnDef } from '@tanstack/react-table';
import type { CustomColumnDef } from '@/components/ui/utils/dataTable';
import { Skeleton } from '@/components/ui/components';
import { TableRow, TableCell } from '@/components/ui/components/Table';

interface SkeletonRowProps<TData, TValue> {
  columns: (ColumnDef<TData, TValue> | CustomColumnDef<TData, TValue>)[];
  rowCount: number;
}

export function SkeletonRow<TData, TValue>({
  columns,
  rowCount,
}: SkeletonRowProps<TData, TValue>) {
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
