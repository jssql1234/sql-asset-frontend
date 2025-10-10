import React from 'react';
import { DataTable } from "@/components/ui/components/Table";
import { Button } from '@/components/ui/components';
import { TooltipWrapper } from '@/components/TooltipWrapper';
import { Edit, Delete } from '@/assets/icons';
import type { UserGroup } from '@/types/user-group';
import type { ColumnDef } from '@tanstack/react-table';

interface UserGroupTableProps {
  groups: UserGroup[];
  onEdit: (group: UserGroup) => void;
  onDelete: (group: UserGroup) => void;
}

export const UserGroupTable: React.FC<UserGroupTableProps> = ({
  groups,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnDef<UserGroup>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => (
        <span className="text-sm text-onSurfaceVariant">{getValue<string>() || '-'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const group = row.original;
        const isAdmin = group.id === 'admin';

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {onEdit(group)}}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {isAdmin ? (
              <TooltipWrapper content="Admin group cannot be deleted as it ensures system functionality">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                  className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10 opacity-50 cursor-not-allowed"
                >
                  <Delete className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {onDelete(group)}}
                className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
              >
                <Delete className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={groups}
      showPagination={true}
      className="w-full"
    />
  );
};