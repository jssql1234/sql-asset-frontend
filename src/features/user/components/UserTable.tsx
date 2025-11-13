import React, { useMemo, useState } from 'react';
import { DataTableExtended, type RowAction } from '@/components/DataTableExtended';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import Search from '@/components/Search';
import type { User } from '@/types/user';
import type { ColumnDef } from '@tanstack/react-table';

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
 const columns: ColumnDef<User>[] = useMemo(() => [
  {
    id: 'contact',
    header: 'Contact',
    cell: ({ row }) => {
      const { name, email, phone } = row.original;
      const details = [email, phone].filter(Boolean).join(' • ');
    return (
        <div className="text-sm text-onSurfaceVariant">
          <div className="font-medium text-onSurface">{name || 'N/A'}</div>
          {details && <div>{details}</div>}
        </div>
      );
    },
  },
  { id: 'position', accessorKey: 'position', header: 'Position' },
  { id: 'location', accessorKey: 'location', header: 'Location' },
  {
    id: 'groupId',
    accessorFn: (row) => groups.find(g => g.id === row.groupId)?.name ?? row.groupId,
    header: 'User Group',
  },
], [groups]);

  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<User>[]>(columns);

  const rowActions: RowAction<User>[] = useMemo(() => [
    { type: 'edit', onClick: onEdit },
    { type: 'delete', onClick: onDelete },
  ], [onEdit, onDelete]);

  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().trim();
    return users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.position?.toLowerCase().includes(term) ?? false) ||
      (u.location?.toLowerCase().includes(term) ?? false) ||
      (groups.find(g => g.id === u.groupId)?.name.toLowerCase().includes(term) ?? false)
    );
  }, [users, searchTerm, groups]);

return (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="relative top-2">
        <TableColumnVisibility
          columns={columns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
      </div>

      <Search
        searchPlaceholder="Search by name, email, or group"
        searchValue={searchTerm}
        onSearch={setSearchTerm}
        live
        className="w-80"
        inputClassName="h-10 w-full"
        showLiveSearchIcon
      />
    </div>

      <style>{`
        [data-table-container] th:last-child {
          background-color: var(--color-surface-container);
        }
      `}</style>

      <div data-table-container>
        <DataTableExtended
          columns={visibleColumns}
          data={filteredUsers}
          showPagination
          rowActions={rowActions}
        />
      </div>
    </div>
  );
};
