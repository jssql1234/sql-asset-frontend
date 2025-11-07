import React, { useMemo } from 'react';
import { DataTableExtended } from '@/components/DataTableExtended';
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from '@/components/ui/components';
import type { WorkRequest, WorkRequestAsset } from '../types';
import { getStatusVariant } from '../constants';

interface WorkRequestTableProps {
  workRequests: WorkRequest[];
  isLoading?: boolean;
  onSelectionChange: (workRequests: WorkRequest[]) => void;
  onReviewWorkRequest?: (workRequest: WorkRequest) => void;
}

const WorkRequestTable: React.FC<WorkRequestTableProps> = ({
  workRequests,
  onReviewWorkRequest,
}) => {
  // Table columns configuration
  const columns: ColumnDef<WorkRequest>[] = useMemo(() => [
    {
      accessorKey: 'requestId',
      header: 'ID',
      cell: ({ getValue }: any) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
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
      accessorKey: 'selectedAssets',
      header: 'Assets',
      cell: ({ getValue }: any) => {
        const assets = getValue() as WorkRequestAsset[];
        const assetNames = assets.map((asset) => asset.main.name).join(', ');
        return (
          <span className="text-sm line-clamp-2 max-w-xs" title={assetNames}>
            {assetNames}
          </span>
        );
      },
    },
    {
      accessorKey: 'requestType',
      header: 'Type',
      cell: ({ getValue }: any) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }: any) => {
        const status = getValue() as WorkRequest['status'];
        return <Badge text={status} variant={getStatusVariant(status)}/>;
      },
    },
    {
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
      accessorKey: 'problemDescription',
      header: 'Problem Description',
      cell: ({ getValue }: any) => (
        <span className="line-clamp-3 max-w-sm text-sm leading-relaxed" title={getValue() as string}>
          {getValue() as string}
        </span>
      ),
    },
  ], []);

  // Row actions configuration
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

  // Sort work requests by request date (latest first)
  const sortedWorkRequests = useMemo(() => {
    return [...workRequests].sort((a, b) => {
      const dateA = new Date(a.requestDate).getTime();
      const dateB = new Date(b.requestDate).getTime();
      return dateB - dateA; 
    });
  }, [workRequests]);

  return (
    <div className="flex flex-col gap-4">
      <DataTableExtended
        columns={columns}
        data={sortedWorkRequests}
        showPagination={true}
        rowActions={rowActions}
      />
    </div>
  );
};

export default WorkRequestTable;