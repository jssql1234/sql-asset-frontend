import React, { useMemo } from 'react';
import { DataTableExtended, type RowAction } from '@/components/DataTableExtended';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import Search from '@/components/Search';
import type { UserGroup } from '@/types/user-group';
import type { ColumnDef } from '@tanstack/react-table';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';

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
  const columns: ColumnDef<UserGroup>[] = useMemo(() => [
    { id: 'id', accessorKey: 'id', header: 'ID' },
    { id: 'name', accessorKey: 'name', header: 'Name' },
    { id: 'description', accessorKey: 'description', header: 'Description' },
  ], []);

  const { toggleableColumns, visibleColumns, setVisibleColumns, displayedColumns } =
    useTableColumns<UserGroup, unknown>({
      columns,
      lockedColumnIds: [],
    });

  const rowActions: RowAction<UserGroup>[] = useMemo(() => [
    {
      type: 'edit',
      onClick: onEdit,
    },
    {
      type: 'delete',
      onClick: onDelete,
      disabled: (g: UserGroup) => g.id === 'admin',
    },
  ], [onEdit, onDelete]);

  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;
    const term = searchTerm.toLowerCase().trim();
    return groups.filter(
      (g) =>
        g.id.toLowerCase().includes(term) ||
        g.name.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term)
    );
  }, [groups, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <TableColumnVisibility
          columns={toggleableColumns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
        <Search
          searchLabel="Search Groups"
          searchPlaceholder="Search by ID, name, or description"
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
          columns={displayedColumns}
          data={filteredGroups}
          showPagination
          rowActions={rowActions} 
        />
      </div>
    </div>
  );
};
