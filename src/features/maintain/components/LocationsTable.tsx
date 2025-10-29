import { useMemo, useCallback } from 'react';
import { Button, Card } from '@/components/ui/components';
import { DataTableExtended } from '@/components/DataTableExtended';
import { TableVisibilityControl } from '@/components/DataTableExtended/TableVisibilityControl';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Delete, Plus } from '@/assets/icons';
import type { Location } from '../types/locations';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import { useTableSelectionSync } from '@/components/DataTableExtended/hooks/useTableSelectionSync';

interface LocationsTableProps {
  locations: Location[];
  selectedLocations: string[];
  onToggleSelection: (id: string) => void;
  onAddLocation: () => void;
  onEditLocation: (location: Location) => void;
  onDeleteMultipleLocations: (ids: string[]) => void;
}

export const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  selectedLocations,
  onToggleSelection,
  onAddLocation,
  onEditLocation,
  onDeleteMultipleLocations,
}) => {
  const columnDefs: ColumnDef<Location>[] = useMemo(() => ([
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
      enableHiding: false,
    },
    {
      id: 'locationId',
      accessorKey: 'id',
      header: 'Location ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.id}</span>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Location',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.address && (
            <div className="text-sm text-onSurfaceVariant line-clamp-2">{row.original.address}</div>
          )}
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const { contactPerson, contactDetails } = row.original;
        const info = [contactPerson, contactDetails].filter(Boolean).join(' • ');
        return (
          <div className="text-sm text-onSurfaceVariant">
            {info || 'No contact info'}
          </div>
        );
      },
    },
  ]), []);

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<Location, unknown>({
    columns: columnDefs,
    lockedColumnIds: ['select'],
  });

  const getLocationId = useCallback((location: Location) => location.id, []);

  const {
    rowSelection,
    handleRowSelectionChange,
    selectedCount,
    hasSelection,
    singleSelectedItem,
    clearSelection,
  } = useTableSelectionSync({
    data: locations,
    selectedIds: selectedLocations,
    getRowId: getLocationId,
    onToggleSelection,
  });

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
            onClick={onAddLocation}
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
                onClick={() => { if (singleSelectedItem) onEditLocation(singleSelectedItem); }}
                disabled={!singleSelectedItem}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => { onDeleteMultipleLocations(selectedLocations); }}
                className="flex items-center gap-2"
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
        data={locations}
        showPagination
        enableRowClickSelection
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
        onColumnOrderChange={handleColumnOrderChange}
      />
    </Card>
  );
};
