import { useMemo, useCallback } from 'react';
import { DataTableExtended } from '@/components/DataTableExtended';
import { TableVisibilityControl } from '@/components/DataTableExtended/TableVisibilityControl';
import { Button, Card } from '@/components/ui/components';
import { Badge } from '@/components/ui/components/Badge';
import { Plus, Edit, Delete } from '@/assets/icons';
import type { AssetGroup } from '../types/assetGroups';
import type { ColumnDef } from '@tanstack/react-table';
import { formatAssetGroupDate } from '../utils/assetGroupUtils';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import { useTableSelectionSync } from '@/components/DataTableExtended/hooks/useTableSelectionSync';

interface AssetGroupsTableProps {
  assetGroups: AssetGroup[];
  selectedIds: string[];
  assetCounts: Record<string, number>;
  onSelectAssetGroup: (id: string) => void;
  onAddAssetGroup: () => void;
  onEditAssetGroup: (assetGroup: AssetGroup) => void;
  onDeleteSelected: () => void;
  hasSingleSelection: boolean;
  onVisibleColumnsChange?: (visible: ColumnDef<AssetGroup>[]) => void;
}

export const AssetGroupsTable: React.FC<AssetGroupsTableProps> = ({
  assetGroups,
  selectedIds,
  assetCounts,
  onSelectAssetGroup,
  onAddAssetGroup,
  onEditAssetGroup,
  onDeleteSelected,
  hasSingleSelection,
  onVisibleColumnsChange,
}) => {
  const columnDefs: ColumnDef<AssetGroup>[] = useMemo(() => ([
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-outlineVariant text-primary focus:ring-primary"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-outlineVariant text-primary focus:ring-primary"
        />
      ),
      enableSorting: false,
    },
    {
      id: 'assetGroupCode',
      accessorKey: 'id',
      header: 'Asset Group Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.id}</span>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Asset Group',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant line-clamp-2">
            {row.original.description || 'No description provided'}
          </div>
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'assetCount',
      accessorFn: (row) => assetCounts[row.id] ?? 0,
      header: 'Asset Count',
      cell: ({ row }) => (
        <Badge
          text={assetCounts[row.original.id] ?? 0}
          className="h-6 px-3 text-sm font-semibold"
          variant={(assetCounts[row.original.id] ?? 0) > 0 ? 'blue' : 'grey'}
        />
      ),
      enableSorting: true,
      sortingFn: 'basic',
      enableColumnFilter: false,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: 'Created Date',
      cell: ({ row }) => (
        <span className="text-sm text-onSurfaceVariant">
          {formatAssetGroupDate(row.original.createdAt) || '-'}
        </span>
      ),
      enableColumnFilter: false,
    }
  ]), [assetCounts]);

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<AssetGroup, unknown>({
    columns: columnDefs,
    lockedColumnIds: ['select'],
    onVisibleColumnsChange,
  });

  const getAssetGroupId = useCallback((group: AssetGroup) => group.id, []);

  const {
    rowSelection,
    handleRowSelectionChange,
    selectedCount,
    hasSelection,
    singleSelectedItem,
    clearSelection,
  } = useTableSelectionSync({
    data: assetGroups,
    selectedIds,
    getRowId: getAssetGroupId,
    onToggleSelection: onSelectAssetGroup,
  });

  const selectedAssetGroupForEdit = hasSingleSelection ? singleSelectedItem : undefined;

  const canDeleteSelected = hasSelection && selectedIds.every(id => (assetCounts[id] ?? 0) === 0);

  return (
    <Card className="p-3 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TableVisibilityControl
            columns={toggleableColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onAddAssetGroup}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
          {hasSelection && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { if (selectedAssetGroupForEdit) onEditAssetGroup(selectedAssetGroupForEdit); }}
                disabled={!selectedAssetGroupForEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDeleteSelected}
                className="flex items-center gap-2"
                disabled={!canDeleteSelected}
              >
                <Delete className="h-4 w-4" />
                Delete Selected
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear Selection
              </Button>
              <div className="body-small text-onSurfaceVariant">
                {selectedCount} selected
              </div>
            </>
          )}
        </div>
      </div>

      <DataTableExtended
        columns={displayedColumns}
        data={assetGroups}
        showPagination
        enableRowClickSelection
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
        onColumnOrderChange={handleColumnOrderChange}
      />
    </Card>
  );
};
