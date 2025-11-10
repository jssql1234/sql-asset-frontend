import React, { useMemo } from 'react';
import { DataTableExtended, type RowAction } from '@/components/DataTableExtended';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { Badge } from '@/components/ui/components/Badge';
import type { AssetGroup } from '../types/assetGroups';
import type { ColumnDef } from '@tanstack/react-table';
import { formatAssetGroupDate } from '../utils/assetGroupUtils';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';

interface AssetGroupsTableProps {
  assetGroups: AssetGroup[];
  assetCounts: Record<string, number>;
  onAddAssetGroup: () => void;
  onEditAssetGroup: (assetGroup: AssetGroup) => void;
  onDeleteSelected: (assetGroup: AssetGroup) => void;
  onVisibleColumnsChange?: (visible: ColumnDef<AssetGroup>[]) => void;
  renderToolbar?: (params: {
    columnVisibility: React.ReactNode;
    actions: React.ReactNode;
  }) => React.ReactNode;
}

export const AssetGroupsTable: React.FC<AssetGroupsTableProps> = ({
  assetGroups,
  assetCounts,
  onEditAssetGroup,
  onDeleteSelected,
  onVisibleColumnsChange,
  renderToolbar,
}) => {
  const columnDefs: ColumnDef<AssetGroup>[] = useMemo(() => [
    {
      id: 'assetGroupCode',
      accessorKey: 'id',
      header: 'Asset Group Code',
      cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.id}</span>,
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
    },
  ], [assetCounts]);

  const { toggleableColumns, visibleColumns, setVisibleColumns, displayedColumns,  } = useTableColumns<AssetGroup, unknown>({
    columns: columnDefs,
    lockedColumnIds: [],
    onVisibleColumnsChange,
  });

  const rowActions: RowAction<AssetGroup>[] = useMemo(() => [
    { type: 'edit', onClick: onEditAssetGroup },
    { type: 'delete', onClick: onDeleteSelected },
  ], [onEditAssetGroup, onDeleteSelected]);

  const columnVisibilityElement = (
    <TableColumnVisibility
      columns={toggleableColumns}
      visibleColumns={visibleColumns}
      setVisibleColumns={setVisibleColumns}
    />
  );

  const actionsElement = null; // 可通过 renderToolbar 传入自定义顶部按钮

  return (
    <div className="space-y-4">
      {renderToolbar ? (
        renderToolbar({ columnVisibility: columnVisibilityElement, actions: actionsElement })
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div>{columnVisibilityElement}</div>
        </div>
      )}

      <DataTableExtended
        columns={displayedColumns}
        data={assetGroups}
        showPagination
        rowActions={rowActions}
      />
    </div>
  );
};
