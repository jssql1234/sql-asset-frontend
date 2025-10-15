import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@/components/ui/components';
import { DataTableExtended } from '@/components/DataTableExtended';
import { TableColumnVisibility } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Delete, Plus } from '@/assets/icons';
import type { Location } from '../types/locations';

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

  const selectionColumn = useMemo(
    () => columnDefs.find(column => column.id === 'select'),
    [columnDefs],
  );

  const visibilityColumns = useMemo(
    () => columnDefs.filter(column => column.id !== 'select'),
    [columnDefs],
  );

  const [visibleColumns, setVisibleColumns] = useState(visibilityColumns);

  useEffect(() => {
    setVisibleColumns(visibilityColumns);
  }, [visibilityColumns]);

  const displayedColumns = useMemo(() => {
    const cols: ColumnDef<Location>[] = [];
    if (selectionColumn) {
      cols.push(selectionColumn);
    }
    cols.push(...visibleColumns);
    return cols;
  }, [selectionColumn, visibleColumns]);

  const handleRowSelectionChange = (selectedRows: Location[]) => {
    const selectedIds = new Set(selectedRows.map(location => location.id));

    selectedIds.forEach(id => {
      if (!selectedLocations.includes(id)) {
        onToggleSelection(id);
      }
    });

    selectedLocations.forEach(id => {
      if (!selectedIds.has(id)) {
        onToggleSelection(id);
      }
    });
  };

  const selectedCount = selectedLocations.length;
  const hasSelection = selectedCount > 0;
  const rowSelection = selectedLocations.reduce<Record<string, boolean>>((acc, locationId) => {
    const index = locations.findIndex(location => location.id === locationId);
    if (index !== -1) {
      acc[index.toString()] = true;
    }
    return acc;
  }, {});

  const selectedLocationForEdit = useMemo(() => {
    if (selectedLocations.length === 1) {
      return locations.find(location => location.id === selectedLocations[0]);
    }
    return undefined;
  }, [locations, selectedLocations]);

  return (
    <Card className="p-3 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TableColumnVisibility
            columns={visibilityColumns}
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
                onClick={() => { if (selectedLocationForEdit) onEditLocation(selectedLocationForEdit); }}
                disabled={!selectedLocationForEdit}
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
                onClick={() => {
                  selectedLocations.forEach(id => { onToggleSelection(id); });
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
        data={locations}
        showPagination
        enableRowClickSelection
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
      />
    </Card>
  );
};
