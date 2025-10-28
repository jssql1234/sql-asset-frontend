import { useEffect, useMemo, useState, useCallback} from 'react';
import { DataTableExtended } from '@/components/DataTableExtended';
import { TableColumnVisibility } from '@/components/ui/components/Table';
import { Button, Card } from '@/components/ui/components';
import { Badge } from '@/components/ui/components/Badge';
import { Plus, Edit, Delete } from '@/assets/icons';
import type { AssetGroup } from '../types/assetGroups';
import type { ColumnDef } from '@tanstack/react-table';
import { formatAssetGroupDate } from '../utils/assetGroupUtils';

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

  const selectionColumn = useMemo(
    () => columnDefs.find(column => column.id === 'select'),
    [columnDefs],
  );

  const visibilityColumns = useMemo(
    () => columnDefs.filter(column => column.id !== 'select'),
    [columnDefs],
  );

  const [visibleColumns, setVisibleColumns] = useState(visibilityColumns);

  const handleSetVisibleColumns = useCallback((newVisible: React.SetStateAction<ColumnDef<AssetGroup>[]>) => {
    setVisibleColumns(prev => {
      const updated = typeof newVisible === 'function' ? newVisible(prev) : newVisible;
      onVisibleColumnsChange?.(updated);
      return updated;
    });
  }, [onVisibleColumnsChange]);

  useEffect(() => {
    const initialVisible = visibilityColumns;
    setVisibleColumns(initialVisible);
    onVisibleColumnsChange?.(initialVisible);
  }, [visibilityColumns, onVisibleColumnsChange]);

  const displayedColumns = useMemo(() => {
    const cols: ColumnDef<AssetGroup>[] = [];
    if (selectionColumn) {
      cols.push(selectionColumn);
    }
    cols.push(...visibleColumns);
    return cols;
  }, [selectionColumn, visibleColumns]);

  const handleRowSelectionChange = (selectedRows: AssetGroup[]) => {
    const selectedIdsSet = new Set(selectedRows.map(assetGroup => assetGroup.id));

    selectedIdsSet.forEach(id => {
      if (!selectedIds.includes(id)) {
        onSelectAssetGroup(id);
      }
    });

    selectedIds.forEach(id => {
      if (!selectedIdsSet.has(id)) {
        onSelectAssetGroup(id);
      }
    });
  };

  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;

  const rowSelection = selectedIds.reduce<Record<string, boolean>>((acc, assetGroupId) => {
    const index = assetGroups.findIndex(assetGroup => assetGroup.id === assetGroupId);
    if (index !== -1) {
      acc[index.toString()] = true;
    }
    return acc;
  }, {});

  const selectedAssetGroupForEdit = useMemo(() => {
    if (!hasSingleSelection) {
      return undefined;
    }
    return assetGroups.find(group => group.id === selectedIds[0]);
  }, [assetGroups, hasSingleSelection, selectedIds]);

  const canDeleteSelected = hasSelection && selectedIds.every(id => (assetCounts[id] ?? 0) === 0);

  return (
    <Card className="p-3 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TableColumnVisibility
            columns={visibilityColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={handleSetVisibleColumns}
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
                onClick={() => {
                  selectedIds.forEach(id => { onSelectAssetGroup(id); });
                }}
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
      />
    </Card>
  );
};
