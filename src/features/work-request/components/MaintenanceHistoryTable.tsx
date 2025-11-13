import React from 'react';
import { cn } from '@/utils/utils';
import { DataTableExtended } from '@/components/DataTableExtended/DataTableExtended';
import type { MaintenanceHistory } from '@/types/work-request';
import { Badge } from '@/components/ui/components/Badge';

interface MaintenanceHistoryTableProps {
  history: MaintenanceHistory[];
  className?: string;
}

export const MaintenanceHistoryTable: React.FC<MaintenanceHistoryTableProps> = ({
  history,
  className
}) => {
  const getStatusVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/[\s-]/g, '-');
    switch (normalizedStatus) {
      case 'completed':
        return 'green';
      case 'approved':
        return 'blue';
      case 'in-progress':
      case 'pending':
      case 'pending-review':
        return 'yellow';
      case 'rejected':
        return 'red';
      default:
        return 'grey';
    }
  };

  const columns = [
    {
      accessorKey: 'assetCode',
      header: 'Asset',
      size: 150,
      cell: ({ getValue }: any) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'workType',
      header: 'Type',
      size: 120,
      cell: ({ getValue }: any) => {
        const workType = getValue() as string;
        return workType ? (
          <span>{workType}</span>
        ) : (
          <span className="text-onSurfaceVariant">N/A</span>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'Work Order No',
      size: 150,
      cell: ({ getValue }: any) => (
        <span className="font-mono text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      size: 130,
      cell: ({ getValue }: any) => {
        const date = new Date(getValue() as string);
        return (
          <span className="text-sm">
            {date.toLocaleDateString('en-UK', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </span>
        );
      },
    },
    {
      accessorKey: 'technician',
      header: 'Technician',
      size: 150,
      cell: ({ getValue }: any) => (
        <span>{(getValue() as string) || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 130,
      cell: ({ getValue }: any) => (
        <Badge 
          text={getValue() as string} 
          variant={getStatusVariant(getValue() as string)}
        />
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      size: 250,
      cell: ({ getValue }: any) => {
        const value = getValue() as string;
        return (
          <div 
            className="line-clamp-3 text-sm" 
            title={value}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {value || 'N/A'}
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      size: 300,
      cell: ({ getValue }: any) => {
        const value = getValue() as string;
        return (
          <div 
            className="line-clamp-3 text-sm text-onSurfaceVariant" 
            title={value}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {value || 'N/A'}
          </div>
        );
      },
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="border border-outlineVariant rounded-md bg-surface">
        {history.length === 0 ? (
          <div className="text-center py-8 text-onSurfaceVariant">
            <span className="italic">No maintenance history found</span>
          </div>
        ) : (
          <DataTableExtended
            columns={columns}
            data={history}
            showPagination={true}
            className="border-none"
          />
        )}
      </div>
    </div>
  );
};