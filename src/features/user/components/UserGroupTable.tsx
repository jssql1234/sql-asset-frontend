import React, { useState, useMemo } from 'react';
import { DataTableExtended as DataTable } from "@/components/DataTableExtended";
import { Button, Card } from '@/components/ui/components';
import { TooltipWrapper } from '@/components/TooltipWrapper';
import Search from '@/components/Search';
import { Edit, Delete } from '@/assets/icons';
import type { UserGroup } from '@/types/user-group';
import type { ColumnDef } from '@tanstack/react-table';
import { TableColumnVisibility } from '@/components/ui/components/Table';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Filter groups based on search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;

    const term = searchTerm.toLowerCase().trim();
    return groups.filter(group =>
      group.id.toLowerCase().includes(term) ||
      group.name.toLowerCase().includes(term) ||
      group.description.toLowerCase().includes(term)
    );
  }, [groups, searchTerm]);

  const columns: ColumnDef<UserGroup>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue<string>()}</span>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => (
        <span className="text-sm text-onSurfaceVariant">{getValue<string>() || '-'}</span>
      ),
      enableColumnFilter: false,
    },
  ];

  const actionCol: ColumnDef<UserGroup>[] = [
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

  const [visibleColumns, setVisibleColumns] = useState(columns);

  return (
    <div className="space-y-4">
      <Search
        searchLabel="Search Groups"
        searchPlaceholder="Search by ID, name, or description"
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        live={true}
        className="w-full"
      />
      <Card className="p-3 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <TableColumnVisibility
            columns={columns}
            visibleColumns={visibleColumns.concat(actionCol)}
            setVisibleColumns={setVisibleColumns}
          />
        </div>
        <DataTable
          columns={visibleColumns.concat(actionCol)}
          data={filteredGroups}
          showPagination={true}
          className="w-full"
        />
      </Card>
      
    </div>
  );
};