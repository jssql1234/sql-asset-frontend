import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@/components/ui/components';
import { DataTable, TableColumnVisibility } from '@/components/ui/components/Table';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Delete, Plus } from '@/assets/icons';
import { Badge } from '@/components/ui/components/Badge';
import type { Department } from '../types/departments';

interface DepartmentsTableProps {
  departments: Department[];
  selectedDepartments: string[];
  onToggleSelection: (id: string) => void;
  onAddDepartment: () => void;
  onEditDepartment: (department: Department) => void;
  onDeleteMultipleDepartments: (ids: string[]) => void;
}

const STATUS_VARIANT_MAP: Record<Department['status'], string> = {
  Active: 'green',
  Inactive: 'grey',
  'Under Review': 'yellow',
};

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
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Department',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-onSurfaceVariant">Code: {row.original.code}</div>
        </div>
      ),
    },
    {
      id: 'manager',
      header: 'Manager',
      cell: ({ row }) => (
        <span className="text-sm text-onSurface">
          {row.original.manager || 'Not assigned'}
        </span>
      ),
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
      header: 'Staff Count',
      cell: ({ row }) => (
        <span className="text-sm text-onSurfaceVariant">
          {departmentStaffCounts[row.original.id] ?? 0} staff
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          text={row.original.status.toUpperCase()}
          variant={STATUS_VARIANT_MAP[row.original.status]}
          className="h-6 px-3 uppercase tracking-wide"
        />
      ),
    },
  ]), [departmentStaffCounts]);

  const selectionColumn = useMemo(
    () => columnDefs.find(column => column.id === 'select'),
    [columnDefs],
  );

  const visibilityColumns = useMemo(
    () => columnDefs.filter(column => column.id !== 'select'),
    [columnDefs],
  );

  const [visibleColumns, setVisibleColumns] = useState(visibilityColumns);

  useEffect(() => {
    setVisibleColumns(visibilityColumns);
  }, [visibilityColumns]);

  const displayedColumns = useMemo(() => {
    const cols: ColumnDef<Department>[] = [];
    if (selectionColumn) {
      cols.push(selectionColumn);
    }
    cols.push(...visibleColumns);
    return cols;
  }, [selectionColumn, visibleColumns]);

  const handleRowSelectionChange = (selectedRows: Department[]) => {
    const selectedIds = new Set(selectedRows.map(department => department.id));

    selectedIds.forEach(id => {
      if (!selectedDepartments.includes(id)) {
        onToggleSelection(id);
      }
    });

    selectedDepartments.forEach(id => {
      if (!selectedIds.has(id)) {
        onToggleSelection(id);
      }
    });
  };

  const selectedCount = selectedDepartments.length;
  const hasSelection = selectedCount > 0;
  const rowSelection = selectedDepartments.reduce<Record<string, boolean>>((acc, departmentId) => {
    const index = departments.findIndex(department => department.id === departmentId);
    if (index !== -1) {
      acc[index.toString()] = true;
    }
    return acc;
  }, {});

  const selectedDepartmentForEdit = useMemo(() => {
    if (selectedDepartments.length === 1) {
      return departments.find(department => department.id === selectedDepartments[0]);
    }
    return undefined;
  }, [departments, selectedDepartments]);

  return (
    <Card className="p-3 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TableColumnVisibility
            columns={visibilityColumns}
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
          {selectedDepartmentForEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { onEditDepartment(selectedDepartmentForEdit); }}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {hasSelection && (
            <>
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
                onClick={() => {
                  selectedDepartments.forEach(id => { onToggleSelection(id); });
                }}
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

      <DataTable
        columns={displayedColumns}
        data={departments}
        showPagination
        enableRowClickSelection
        onRowSelectionChange={handleRowSelectionChange}
        rowSelection={rowSelection}
      />
    </Card>
  );
};
