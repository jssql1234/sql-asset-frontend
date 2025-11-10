import React from 'react';
import { DataTableExtended, type RowAction } from '@/components/DataTableExtended';
import type { Location } from '../types/locations';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Delete } from '@/assets/icons';

interface LocationsTableProps {
  locations: Location[];
  onEditLocation: (location: Location) => void;
  onDeleteLocation: (location: Location) => void;
  displayedColumns: ColumnDef<Location>[];
  handleColumnOrderChange: (updater: any) => void;
}

export const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  onEditLocation,
  onDeleteLocation,
  displayedColumns,
  handleColumnOrderChange,
}) => {

  const rowActions: RowAction<Location>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => onEditLocation(row),
      type: 'edit',
    },
    {
      label: 'Delete',
      icon: Delete,
      onClick: (row) => onDeleteLocation(row),
     
      type: 'delete',
    },
  ];

  const columnsWithActions = displayedColumns;

  return (
    <div className="w-full [&_thead_th]:bg-gray-100">
      <DataTableExtended
        columns={columnsWithActions}
        data={locations}
        showPagination
        onColumnOrderChange={handleColumnOrderChange}
        rowActions={rowActions}
      />
    </div>
  );
};
