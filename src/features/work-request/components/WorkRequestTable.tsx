import React, { useMemo } from 'react';
import { DataTableExtended } from '@/components/DataTableExtended';
import { type ColumnDef } from "@tanstack/react-table";
import { WorkRequestStatusBadge } from './WorkRequestBadges';
import type { WorkRequest, WorkRequestAsset } from '@/types/work-request';

interface WorkRequestTableProps {
  workRequests: WorkRequest[];
  // selectedWorkRequestIds: string[];
  isLoading?: boolean;
  onSelectionChange: (workRequests: WorkRequest[]) => void;
  onEditWorkRequest?: (workRequest: WorkRequest) => void;
}

const WorkRequestTable: React.FC<WorkRequestTableProps> = ({
  workRequests,
  // selectedWorkRequestIds: _selectedWorkRequestIds,
  // isLoading = false,
  // onSelectionChange,
  onEditWorkRequest,
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
      cell: ({ getValue }: any) => (
        <WorkRequestStatusBadge status={getValue() as WorkRequest['status']} />
      ),
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

  // const handleRowSelectionChange = (selectedRows: WorkRequest[], _selectedRowIds: string[]) => {
  //   onSelectionChange(selectedRows);
  // };

  // // Convert selectedWorkRequestIds to selected row state
  // const selectedRowState = useMemo(() => {
  //   const selectedState: Record<string, boolean> = {};
  //   workRequests.forEach((request, index) => {
  //     selectedState[index] = _selectedWorkRequestIds.includes(request.id);
  //   });
  //   return selectedState;
  // }, [workRequests, _selectedWorkRequestIds]);

  return (
    <div className="flex flex-col gap-4">
      <DataTableExtended
        columns={columns}
        data={workRequests}
        showPagination={true}
      />
    </div>
  );
};

export default WorkRequestTable;