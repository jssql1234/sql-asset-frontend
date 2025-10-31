import { useMemo, useCallback } from 'react';
import { Button, Card } from '@/components/ui/components';
import { DataTableExtended } from '@/components/DataTableExtended';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Delete, Plus } from '@/assets/icons';
import { Badge } from '@/components/ui/components/Badge';
import type { Department } from '../types/departments';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import { useTableSelectionSync } from '@/components/DataTableExtended/hooks/useTableSelectionSync';

interface DepartmentsTableProps {
  departments: Department[];
  selectedDepartments: string[];
  onToggleSelection: (id: string) => void;
  onAddDepartment: () => void;
  onEditDepartment: (department: Department) => void;
  onDeleteMultipleDepartments: (ids: string[]) => void;
}

export const DepartmentsTable: React.FC<DepartmentsTableProps> = ({
  departments,
  selectedDepartments,
  onToggleSelection,
  onAddDepartment,
  onEditDepartment,
  onDeleteMultipleDepartments,
}) => {
  const departmentStaffCounts = useMemo(() => {
    if (typeof window === 'undefined') {
      return {} as Record<string, number>;
    }

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
    departments.forEach(department => {
      counts[department.id] = counts[department.id] ?? 0;
    });

    return counts;
  }, [departments]);

  const columnDefs: ColumnDef<Department>[] = useMemo(() => ([
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
      id: 'departmentId',
      accessorKey: 'id',
      header: 'Department ID',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.id}</span>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Department',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">Code: {row.original.typeId}</div>
        </div>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'manager',
      accessorKey: 'manager',
      header: 'Manager',
      cell: ({ row }) => (
        <span className="text-sm text-onSurface">
          {row.original.manager || 'Not assigned'}
        </span>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => (
        <span className="text-sm text-onSurfaceVariant">
          {row.original.contact || 'No contact info'}
        </span>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="text-sm text-onSurfaceVariant line-clamp-2">
          {row.original.description || 'No description provided'}
        </div>
      ),
    },
    {
      id: 'staffCount',
      accessorFn: (row) => departmentStaffCounts[row.id] ?? 0,
      header: 'Staff Count',
      cell: ({ row }) => (
        <Badge
          text={departmentStaffCounts[row.original.id] ?? 0}
          className="h-6 px-3 text-sm font-semibold"
        />
      ),
      enableColumnFilter: false,
    },
  ]), [departmentStaffCounts]);

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<Department, unknown>({
    columns: columnDefs,
    lockedColumnIds: ['select'],
  });

  const getDepartmentId = useCallback((department: Department) => department.id, []);

  const {
    rowSelection,
    handleRowSelectionChange,
    selectedCount,
    hasSelection,
    singleSelectedItem,
    clearSelection,
  } = useTableSelectionSync({
    data: departments,
    selectedIds: selectedDepartments,
    getRowId: getDepartmentId,
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
            onClick={onAddDepartment}
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
                onClick={() => { if (singleSelectedItem) onEditDepartment(singleSelectedItem); }}
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
                onClick={() => { onDeleteMultipleDepartments(selectedDepartments); }}
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
        data={departments}
        showPagination
        enableRowClickSelection
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
        onColumnOrderChange={handleColumnOrderChange}
      />
    </Card>
  );
};
