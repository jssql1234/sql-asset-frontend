import { useMemo, useCallback } from 'react';
import { Button, Card } from '@/components/ui/components';
import { DataTableExtended } from '@/components/DataTableExtended';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Delete, Plus } from '@/assets/icons';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import { useTableSelectionSync } from '@/components/DataTableExtended/hooks/useTableSelectionSync';
import type { ServiceProvider } from '../types/serviceProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';

interface ServiceProviderTableProps {
  serviceProvider: ServiceProvider[];
  selectedServiceProvider: string[];
  onToggleSelection: (id: string) => void;
  onAddServiceProvider: () => void;
  onEditServiceProvider: (serviceProvider: ServiceProvider) => void;
  onDeleteMultipleServiceProvider: (ids: string[]) => void;
}

export const ServiceProviderTable: React.FC<ServiceProviderTableProps> = ({
  serviceProvider,
  selectedServiceProvider,
  onToggleSelection,
  onAddServiceProvider,
  onEditServiceProvider,
  onDeleteMultipleServiceProvider,
}) => {

  const columns: ColumnDef<ServiceProvider>[] = useMemo(() =>([
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
      id:'name',
      accessorKey: 'name',
      header: 'Provider Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">Code: {row.original.code}</div>
        </div>
      ),
      enableColumnFilter: false,
    },
 {
      id:'description',  
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const description = row.original.description || '';
        const truncatedText = description.length > 50 ? `${description.slice(0, 50)}...` : description;
        
        return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm max-w-[200px] truncate">
                {truncatedText}
              </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className="max-w-xs whitespace-pre-wrap bg-white p-2 rounded shadow-lg border">{description} </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        );
      },
      enableColumnFilter: false,
    },
    {  
      id:'contactPerson',  
      accessorKey: 'contactPerson',
      header: 'Contact Person',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.contactPerson}</div>
      ),
      enableColumnFilter: false,
    },
    {
      id:'email',
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-onSurfaceVariant">{row.original.email}</div>
      ),
      enableColumnFilter: false,
    },
    {
      id:'phone',  
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="text-sm">{row.original.phone}</div>
      ),
      enableColumnFilter: false,
    },
    {
      id:'status',  
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {row.original.status}
        </span>
      ),
      enableColumnFilter: false,
    },    
  ]), []);

  

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<ServiceProvider, unknown>({
    columns: columns,
    lockedColumnIds: ['select'],
  });

  const getServiceProviderId = useCallback((serviceProvider: ServiceProvider) => serviceProvider.id, []);

  const {
    rowSelection,
    handleRowSelectionChange,
    selectedCount,
    hasSelection,
    singleSelectedItem,
    clearSelection,
  } = useTableSelectionSync({
    data: serviceProvider,
    selectedIds: selectedServiceProvider,
    getRowId: getServiceProviderId,
    onToggleSelection,
  });

  return (
    <Card className="p-3 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TableColumnVisibility
            columns={toggleableColumns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={onAddServiceProvider}
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
                onClick={() => { if (singleSelectedItem) onEditServiceProvider(singleSelectedItem); }}
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
                onClick={() => { onDeleteMultipleServiceProvider(selectedServiceProvider); }}
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
        data={serviceProvider}
        showPagination
        enableRowClickSelection
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
        onColumnOrderChange={handleColumnOrderChange}
      />
    </Card>
  );
};
