import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/components/Badge';
import { DataTableExtended } from '@/components/DataTableExtended';
import { type ColumnDef } from "@tanstack/react-table";
import { WorkRequestStatusBadge } from './WorkRequestBadges';
import type { WorkRequest, WorkRequestAsset } from '@/types/work-request';

interface WorkRequestTableProps {
  workRequests: WorkRequest[];
  selectedWorkRequestIds: string[];
  isLoading?: boolean;
  onSelectionChange: (workRequests: WorkRequest[]) => void;
  onEditWorkRequest?: (workRequest: WorkRequest) => void;
}

const WorkRequestTable: React.FC<WorkRequestTableProps> = ({
  workRequests,
  selectedWorkRequestIds: _selectedWorkRequestIds,
  isLoading = false,
  onSelectionChange,
  onEditWorkRequest,
}) => {
  // Table columns configuration
  const columns: ColumnDef<WorkRequest>[] = useMemo(() => [
    {
      accessorKey: 'requestId',
      header: 'Request #',
      cell: ({ getValue }: any) => (
        <span className="font-mono text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'requesterName',
      header: 'Requester',
      cell: ({ getValue }: any) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ getValue }: any) => (
        <span>{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'selectedAssets',
      header: 'Assets',
      cell: ({ getValue }: any) => {
        const assets = getValue() as WorkRequestAsset[];
        return (
          <div className="flex flex-wrap gap-1">
            {assets.slice(0, 2).map((asset) => (
              <Badge
                key={asset.main.code}
                text={asset.main.code}
                variant="primary"
                className="text-xs"
              />
            ))}
            {assets.length > 2 && (
              <Badge
                text={`+${assets.length - 2} more`}
                variant="grey"
                className="text-xs"
              />
            )}
          </div>
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

  const handleRowSelectionChange = (selectedRows: WorkRequest[], _selectedRowIds: string[]) => {
    onSelectionChange(selectedRows);
  };

  // Convert selectedWorkRequestIds to selected row state
  const selectedRowState = useMemo(() => {
    const selectedState: Record<string, boolean> = {};
    workRequests.forEach((request, index) => {
      selectedState[index] = _selectedWorkRequestIds.includes(request.id);
    });
    return selectedState;
  }, [workRequests, _selectedWorkRequestIds]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="title-medium font-medium text-onSurface">
          Work Requests ({workRequests.length})
        </h2>
      </div>
      
      <DataTableExtended
        columns={columns}
        data={workRequests}
        showPagination={true}
        className="border border-outline"
        onRowDoubleClick={onEditWorkRequest}
      />
    </div>
  );
};

export default WorkRequestTable;