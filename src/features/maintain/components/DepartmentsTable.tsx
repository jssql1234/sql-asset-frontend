import React, { useMemo } from 'react';
import { DataTableExtended } from '@/components/DataTableExtended/DataTableExtended';
import type { RowAction } from '@/components/DataTableExtended/types';
import { Edit, Delete } from '@/assets/icons';
import { Badge } from '@/components/ui/components/Badge';
import type { Department } from '../types/departments';
import type { ColumnDef } from '@tanstack/react-table';
 
interface DepartmentsTableProps {
  departments: Department[];
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (department: Department) => void;
  displayedColumns: ColumnDef<Department>[];
}

export const DepartmentsTable: React.FC<DepartmentsTableProps> = ({
  departments,
  onEditDepartment,
  onDeleteDepartment,
  displayedColumns,
}) => {

  const departmentStaffCounts = useMemo(() => {
    if (typeof window === 'undefined') return {} as Record<string, number>;

    let staffCountMap: Record<string, number> = {};
    try {
      const stored = window.localStorage.getItem('staffData');
      const parsed = stored ? JSON.parse(stored) as { staff?: { departmentId?: string }[] } : null;
      const staff = Array.isArray(parsed?.staff) ? parsed.staff : [];
      staffCountMap = staff.reduce<Record<string, number>>((acc, item) => {
        if (item.departmentId) {
          acc[item.departmentId] = (acc[item.departmentId] ?? 0) + 1;
        }
        return acc;
      }, {});
    } catch (error) {
      console.error('Error reading staff data for department counts:', error);
    }

    const counts: Record<string, number> = { ...staffCountMap };
    departments.forEach(dept => {
      counts[dept.id] = counts[dept.id] ?? 0;
    });
    return counts;
  }, [departments]);

  const columnsWithStaffCount: ColumnDef<Department>[] = useMemo(() => [
    ...displayedColumns,
    {
      id: 'staffCount',
      header: 'Staff Count',
      accessorFn: row => departmentStaffCounts[row.id] ?? 0,
      cell: ({ row }) => (
        <Badge text={departmentStaffCounts[row.original.id] ?? 0} className="h-6 px-3 text-sm font-semibold" />
      ),
      enableColumnFilter: false,
    }
  ], [displayedColumns, departmentStaffCounts]);

  const rowActions: RowAction<Department>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: row => onEditDepartment(row),
      type: 'edit',
    },
    {
      label: 'Delete',
      icon: Delete,
      onClick: row => onDeleteDepartment(row),
      type: 'delete',
    },
  ];

  return (
    <div>
      <style>{`
        [data-table-container] th:last-child {
          background-color: var(--color-surface-container);
        }
      `}</style>

      <div data-table-container>
        <DataTableExtended
          columns={columnsWithStaffCount}
          data={departments}
          showPagination
          rowActions={rowActions}
        />
      </div>
    </div>
  );
};