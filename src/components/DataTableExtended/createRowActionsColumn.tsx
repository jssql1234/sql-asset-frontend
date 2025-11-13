/**
 * Create row actions column for the DataTable
 */

import type { ComponentType } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/components';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import type { RowAction, RowActionType } from './types';

const ACTION_DEFAULTS: Record<RowActionType, { icon: ComponentType<{ className?: string }>; label: string }> = {
  view: { icon: Eye, label: 'View' },
  edit: { icon: Edit, label: 'Edit' },
  delete: { icon: Trash2, label: 'Delete' },
  custom: { icon: MoreHorizontal, label: 'Action' },
};

export function createRowActionsColumn<TData, TValue>(
  rowActions: RowAction<TData>[]
): ColumnDef<TData, TValue> {
  return {
    id: "row-actions",
    header: "",
    cell: ({ row }) => (
      <div 
        className="flex items-center justify-center"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger>
            <button
              type="button"
              aria-label="Row actions"
              className="h-8 w-8 p-0 hover:bg-surfaceContainerHighest rounded-full flex items-center justify-center transition-colors focus:outline-none"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <MoreHorizontal className="h-4 w-4 text-onSurfaceVariant" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {rowActions.map((action, index) => {
              const { icon: defaultIcon, label: defaultLabel } = ACTION_DEFAULTS[action.type];
              const ActionIcon = action.icon ?? defaultIcon;
              const label = action.label ?? defaultLabel;
              const variant = action.type === 'delete' ? 'destructive' : 'default';
              const key = action.id ?? `${action.type}-${index.toString()}`;

              return (
                <DropdownMenuItem
                  key={key}
                  onClick={() => {
                    action.onClick(row.original);
                  }}
                  className={`flex items-center ${variant === 'destructive' ? 'text-error focus:text-error' : ''}`}
                >
                  <ActionIcon className="h-4 w-4 mr-2" />
                  {label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
    size: 60,
  };
}
