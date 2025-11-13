import React, { useMemo } from 'react';
import { DataTableExtended } from '@/components/DataTableExtended';
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from '@/components/ui/components';
import TableColumnVisibility from "@/components/ui/components/Table/TableColumnVisibility";
import type { WorkRequest, WorkRequestAsset } from '../types';
import { getStatusVariant } from '../constants';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';

interface WorkRequestTableProps {
  workRequests: WorkRequest[];
  isLoading?: boolean;
  onSelectionChange: (workRequests: WorkRequest[]) => void;
  onReviewWorkRequest?: (workRequest: WorkRequest) => void;
  searchComponent?: React.ReactNode;
}

const WorkRequestTable: React.FC<WorkRequestTableProps> = ({
  workRequests,
  onReviewWorkRequest,
  searchComponent,
}) => {
  // Table columns configuration
  const columns: ColumnDef<WorkRequest>[] = useMemo(() => [
    {
      id: 'requestId',
      accessorKey: 'requestId',
      header: 'ID',
      cell: ({ getValue }: any) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      id: 'requesterName',
      accessorKey: 'requesterName',
      header: 'Requester',
      cell: ({ row }) => {
        const value = row.original;
        return (
          <div className="flex flex-col gap-1">
            <span className="label-medium text-onSurface">{value.requesterName}</span>
            <span className="body-small text-onSurfaceVariant">
              {value.department}
            </span>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    },
    {
      id: 'selectedAssets',
      accessorKey: 'selectedAssets',
      header: 'Assets',
      cell: ({ getValue }: any) => {
        const assets = getValue() as WorkRequestAsset[];
        const assetNames = assets.map((asset) => asset.main.name).join(', ');

        return (
          <div className="flex flex-wrap gap-1 " title={assetNames}>
            {assets.map((asset) => (
              <Badge
                key={asset.main.name} 
                text={asset.main.name}
                variant="grey"
                className="h-7 px-3 py-1 text-sm"
              />
            ))}
          </div>
        );
      },
    },
    {
      id: 'requestType',
      accessorKey: 'requestType',
      header: 'Type',
      cell: ({ getValue }: any) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const status = getValue() as WorkRequest['status'];
        return <Badge text={status} variant={getStatusVariant(status)} />;
      },
    },
    {
      id: 'requestDate',
      accessorKey: 'requestDate',
      header: 'Request Date',
      cell: ({ getValue }: any) => {
        const date = new Date(getValue() as string);
        return (
          <span className="text-sm">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        );
      },
    },
    {
      id: 'problemDescription',
      accessorKey: 'problemDescription',
      header: 'Problem Description',
      cell: ({ getValue }: any) => (
        <span className="line-clamp-3 max-w-sm text-sm leading-relaxed" title={getValue() as string}>
          {getValue() as string}
        </span>
      ),
    },
  ], []);

  const { toggleableColumns, visibleColumns, setVisibleColumns, displayedColumns } =
    useTableColumns<WorkRequest, unknown>({
      columns,
      lockedColumnIds: [],
    });

  const rowActions = useMemo(() => {
    const actions = [];
    
    if (onReviewWorkRequest) {
      actions.push({
        type: 'view' as const,
        label: 'Review',
        onClick: (row: WorkRequest) => onReviewWorkRequest(row),
      });
    }
    
    return actions;
  }, [onReviewWorkRequest]);

  const sortedWorkRequests = useMemo(() => {
    return [...workRequests].sort((a, b) => {
      const dateA = new Date(a.requestDate).getTime();
      const dateB = new Date(b.requestDate).getTime();
      return dateB - dateA; 
    });
  }, [workRequests]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <TableColumnVisibility
          columns={toggleableColumns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
        {searchComponent}
      </div>
      
      <DataTableExtended
        columns={displayedColumns}
        data={sortedWorkRequests}
        showPagination={true}
        rowActions={rowActions}
      />
    </div>
);
};

export default WorkRequestTable;
