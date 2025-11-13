/**
 * DataTableRow component for rendering table rows
 */

import type { MouseEvent } from 'react';
import type { Row, Table as TanStackTable } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { cn } from '@/utils/utils';
import { TableRow, TableCell } from '@/components/ui/components/Table';

interface DataTableRowProps<TData> {
  table: TanStackTable<TData>;
  enableRowClickSelection?: boolean;
  columnOrder: string[];
}

export function DataTableRow<TData>({
  table,
  enableRowClickSelection = false,
  columnOrder,
}: DataTableRowProps<TData>) {
  const handleRowClick = (row: Row<TData>, event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInteractiveElement = target.closest(
      'button, a, input, select, textarea, [role="button"]'
    );
    // Prioritize selection on row click when enabled
    if (
      enableRowClickSelection &&
      !isInteractiveElement &&
      row.getCanSelect()
    ) {
      event.preventDefault();
      row.toggleSelected(!row.getIsSelected());
      return;
    }
  };

  return (
    <>
      {table.getRowModel().rows.map((row) => {
        const sortedCells = [...row.getVisibleCells()].sort((a, b) => {
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
              'group/row',
              enableRowClickSelection && row.getCanSelect() && 'cursor-pointer',
              row.getIsGrouped() && 'cursor-pointer'
            )}
          >
            {sortedCells.map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </>
  );
}
