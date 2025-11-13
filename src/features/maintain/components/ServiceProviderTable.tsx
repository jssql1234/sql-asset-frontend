import React, { useMemo } from 'react';
import { DataTableExtended, type RowAction } from '@/components/DataTableExtended';
import { Edit, Delete } from '@/assets/icons';
import type { ColumnDef } from '@tanstack/react-table';
import type { ServiceProvider } from '../types/serviceProvider';

interface ServiceProviderTableProps {
  serviceProvider: ServiceProvider[];
  columns: ColumnDef<ServiceProvider>[];
  onEditProvider: (provider: ServiceProvider) => void;
  onDeleteProvider: (provider: ServiceProvider) => void;
}

export const ServiceProviderTable: React.FC<ServiceProviderTableProps> = ({
  serviceProvider,
  columns,
  onEditProvider,
  onDeleteProvider,
}) => {
  const rowActions: RowAction<ServiceProvider>[] = useMemo(() => [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => onEditProvider(row),
      type: 'edit',
    },
    {
      label: 'Delete',
      icon: Delete,
      onClick: (row) => onDeleteProvider(row),
      type: 'delete',
    },
  ], [onEditProvider, onDeleteProvider]);

  return (
    <div>
      <style>{`
        [data-table-container] th:last-child {
          background-color: var(--color-surface-container);
        }
      `}</style>

      <div data-table-container>
        <DataTableExtended
          columns={columns}
          data={serviceProvider}
          showPagination
          rowActions={rowActions}
        />
      </div>
    </div>
  );
};
