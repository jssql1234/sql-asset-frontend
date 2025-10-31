import React, { useState, useMemo } from 'react';
import { DataTableExtended as DataTable } from "@/components/DataTableExtended";
import { Button, Card } from '@/components/ui/components';
import Search from '@/components/Search';
import { Edit, Delete } from '@/assets/icons';
import type { User } from '@/types/user';
import type { ColumnDef } from '@tanstack/react-table';
import { TableColumnVisibility } from '@/components/ui/components/Table';

interface UserTableProps {
  users: User[];
  groups: { id: string; name: string }[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  groups,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const term = searchTerm.toLowerCase().trim();
    return users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.position?.toLowerCase().includes(term) ?? false) ||
      (user.department?.toLowerCase().includes(term) ?? false) ||
      (user.location?.toLowerCase().includes(term) ?? false) ||
      (groups.find(g => g.id === user.groupId)?.name.toLowerCase().includes(term) ?? false)
    );
  }, [users, searchTerm, groups]);

  const columns: ColumnDef<User>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      enableColumnFilter: false,
    },
    {
      id: 'email',
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span>{row.original.email}</span>,
      enableColumnFilter: false,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => <span>{row.original.phone ?? '-'}</span>,
      enableColumnFilter: false,
    },
    {
      id: 'position',
      accessorKey: 'position',
      header: 'Position',
      cell: ({ row }) => <span>{row.original.position ?? '-'}</span>,
      enableColumnFilter: false,
    },
    {
      id: 'department',
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <span>{row.original.department ?? '-'}</span>,
    },
    {
      id: 'location',
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => <span>{row.original.location ?? '-'}</span>,
    },
    {
      id: 'groupId',
      accessorFn: (row) => {
        const group = groups.find(g => g.id === row.groupId);
        return group?.name ?? row.groupId;
      },
      header: 'User Group',
      cell: ({ row }) => {
        const group = groups.find(g => g.id === row.original.groupId);
        return <span>{group?.name ?? row.original.groupId}</span>;
      },
    },
  ];

  const actionCol: ColumnDef<User>[] = [
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onEdit(row.original);
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onDelete(row.original);
            }}
            className="h-8 w-8 p-0 text-error hover:text-error hover:bg-error/10"
          >
            <Delete className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
    
  const [visibleColumns, setVisibleColumns] = useState(columns);

  return (
    <div className="space-y-4">
      <Search
        searchLabel="Search Users"
        searchPlaceholder="Search by name, email, position, department, location, or group"
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
          data={filteredUsers}
          showPagination={true}
          className="w-full"
        />
      </Card>
    </div>
  );
};