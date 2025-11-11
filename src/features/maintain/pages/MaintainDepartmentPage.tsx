import React, { useState } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import Search from "@/components/Search";
import { DepartmentsTable } from '../components/DepartmentsTable';
import { DepartmentFormModal } from '../components/DepartmentFormModal';
import { useDepartments } from '../hooks/useDepartments';
import { Button } from '@/components/ui/components';
import { Plus } from '@/assets/icons';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import type { Department } from '../types/departments';

const columnDefs = [
  {
    id: 'departmentId',
    accessorKey: 'id',
    header: 'Department ID',
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Department',
    cell: ({ row }: any) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-onSurfaceVariant">Code: {row.original.typeId}</div>
      </div>
    ),
  },
  {
    id: 'manager',
    accessorKey: 'manager',
    header: 'Manager',
    cell: ({ row }: any) => <span className="text-sm text-onSurface">{row.original.manager || 'Not assigned'}</span>,
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: ({ row }: any) => <span className="text-sm text-onSurfaceVariant">{row.original.contact || 'No contact info'}</span>,
  },
  {
    id: 'description',
    header: 'Description',
    cell: ({ row }: any) => <div className="text-sm text-onSurfaceVariant line-clamp-2">{row.original.description || 'No description provided'}</div>,
  },
];

const MaintainDepartmentPage: React.FC = () => {
  const {
    departments,
    filteredDepartments,
    filters,
    departmentTypes,
    editingDepartment,
    updateFilters,
    handleSaveDepartment,
    handleDeleteMultipleDepartments,
  } = useDepartments();

  const {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  } = useTableColumns<Department, unknown>({
    columns: columnDefs,
    lockedColumnIds: [],
  });

  const [modals, setModals] = useState({ editDepartment: false });
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const handleEditClick = (department: Department) => {
    setSelectedDepartment(department);
    setModals({ editDepartment: true });
  };

  const handleAddClick = () => {
    setSelectedDepartment(null);
    setModals({ editDepartment: true });
  };

  const handleModalClose = () => {
    setModals({ editDepartment: false });
    setSelectedDepartment(null);
  };

  const handleDeleteClick = (department: Department) => {
    handleDeleteMultipleDepartments([department.id]);
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <TabHeader
            title="Department Management"
            subtitle="Manage department information and configurations"
          />
          <Button size="sm" onClick={handleAddClick} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <TableColumnVisibility
              columns={toggleableColumns}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
            />
          </div>
          <div className="flex-1 flex justify-end">
            <Search
              searchValue={filters.search ?? ""}
              searchPlaceholder="Search departments..."
              onSearch={(value) => updateFilters({ ...filters, search: value })}
              live
              className="w-80"
              inputClassName="h-10 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <DepartmentsTable
            departments={filteredDepartments}
            onEditDepartment={handleEditClick}
            onDeleteDepartment={handleDeleteClick}
            displayedColumns={displayedColumns}
            handleColumnOrderChange={handleColumnOrderChange}
          />
        </div>

        <DepartmentFormModal
          isOpen={modals.editDepartment}
          onClose={handleModalClose}
          onSave={handleSaveDepartment}
          editingDepartment={selectedDepartment ?? editingDepartment}
          existingDepartments={departments}
          departmentTypes={departmentTypes}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainDepartmentPage;
