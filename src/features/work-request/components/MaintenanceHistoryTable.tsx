import React, { useState } from 'react';
import { cn } from '@/utils/utils';
import { DataTable } from '@/components/ui/components/Table/DataTable';
import { TablePagination } from '@/components/ui/components/Table/TablePagination';
import SelectDropdown from '@/components/SelectDropdown';
import type { MaintenanceHistory } from '@/types/work-request';
import { Badge } from '@/components/ui/components/Badge';

interface MaintenanceHistoryTableProps {
  history: MaintenanceHistory[];
  selectedAssets: { main: { code: string; name: string } }[];
  className?: string;
}

export const MaintenanceHistoryTable: React.FC<MaintenanceHistoryTableProps> = ({
  history,
  selectedAssets,
  className
}) => {
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0); // 0-based indexing for TablePagination
  const [pageSize, setPageSize] = useState(10);

  const filteredHistory = React.useMemo(() => {
    if (!selectedAssetFilter) return history;
    return history.filter(record => record.assetCode === selectedAssetFilter);
  }, [history, selectedAssetFilter]);

  const paginatedHistory = React.useMemo(() => {
    const startIndex = currentPage * pageSize;
    return filteredHistory.slice(startIndex, startIndex + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

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

  const getWorkTypeVariant = (workType: string) => {
    const normalizedType = workType?.toLowerCase();
    switch (normalizedType) {
      case 'preventive':
      case 'maintenance':
        return 'green';
      case 'corrective':
      case 'repair':
        return 'yellow';
      case 'emergency':
        return 'red';
      case 'inspection':
        return 'blue';
      default:
        return 'primary';
    }
  };

  const columns = [
    {
      accessorKey: 'assetCode',
      header: 'Asset',
      cell: ({ getValue }: any) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'workType',
      header: 'Type',
      cell: ({ getValue }: any) => {
        const workType = getValue() as string;
        return workType ? (
          <Badge 
            text={workType} 
            variant={getWorkTypeVariant(workType)}
          />
        ) : (
          <span className="text-onSurfaceVariant">N/A</span>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'Work Order #',
      cell: ({ getValue }: any) => (
        <span className="font-mono text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
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
      accessorKey: 'technician',
      header: 'Technician',
      cell: ({ getValue }: any) => (
        <span>{(getValue() as string) || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
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
      cell: ({ getValue }: any) => {
        const value = getValue() as string;
        return (
          <span className="truncate" title={value}>
            {value || 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }: any) => {
        const value = getValue() as string;
        return (
          <span className="truncate text-sm text-onSurfaceVariant" title={value}>
            {value || 'N/A'}
          </span>
        );
      },
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-onSurface mb-2">
            Filter by Asset
          </label>
          <SelectDropdown
            value={selectedAssetFilter}
            onChange={(value) => {
              setSelectedAssetFilter(value);
              setCurrentPage(0);
            }}
            options={[
              { value: '', label: 'All Assets' },
              ...selectedAssets.map((asset) => ({
                value: asset.main.code,
                label: `${asset.main.code} - ${asset.main.name}`,
              })),
            ]}
            placeholder="All Assets"
            className="w-full"
            maxVisibleOptions={5}
          />
        </div>
      </div>

      <div className="border border-outlineVariant rounded-md bg-surface">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-onSurfaceVariant">
            <span className="italic">No maintenance history found</span>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={paginatedHistory}
              showPagination={false}
              className="border-none"
            />
            
            <TablePagination
              totalCount={filteredHistory.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              className="border-t border-outlineVariant bg-surfaceContainerLowest"
            />
          </>
        )}
      </div>
    </div>
  );
};