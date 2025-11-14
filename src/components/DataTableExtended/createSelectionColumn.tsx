/**
 * Create selection column for the DataTable
 */

import type { ChangeEvent } from 'react';
import type { ColumnDef, Row, Table as TanStackTable } from '@tanstack/react-table';
import { Option } from '@/components/ui/components';

interface CreateSelectionColumnOptions {
  isGroupingEnabled: boolean;
}

export function createSelectionColumn<TData, TValue>(
  options: CreateSelectionColumnOptions
): ColumnDef<TData, TValue> {
  const { isGroupingEnabled } = options;
  
  return {
    id: "select",
    meta: { order: 0 }, // Ensure selection column is always first
    header: ({ table }: { table: TanStackTable<TData> }) => {
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
    cell: ({ row }: { row: Row<TData> }) => {
      // In grouping mode, disable selection for leaf rows
      if (!row.getCanSelect()) {
        return null;
      }
      const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        row.toggleSelected(event.target.checked);
      };

      return (
        <div
          className="flex items-center gap-4"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Option
            checked={row.getIsSelected()}
            onChange={handleToggle}
          />
        </div>
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 1,
  };
}
