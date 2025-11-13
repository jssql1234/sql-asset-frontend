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
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

const columnDefs = [
  {
    id: 'departmentId',
    accessorKey: 'id',
    header: 'Department ID',
    cell: ({ row }: any) => (
      <span className="font-normal">{row.original.id}</span>
    ),
    enableColumnFilter: false,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Department',
    cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
    ),
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: ({ row }: any) => {
      const { manager, contact } = row.original;
      const info = [manager, contact].filter(Boolean).join(' • ');
      return (
        <div className="text-sm text-onSurfaceVariant">
          {info || 'No contact info'}
        </div>
      );
    },
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
    updateFilters,
    handleSaveDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
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

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const handleEditClick = (department: Department) => {
    handleEditDepartment(department);
    setSelectedDepartment(department);
    setIsFormModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedDepartment(null);
    setIsFormModalOpen(true);
  };

  const handleModalClose = () => {
    setIsFormModalOpen(false);
    setSelectedDepartment(null);
  };

  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department);
  };

  const handleConfirmDelete = () => {
    if (departmentToDelete) {
      handleDeleteDepartment(departmentToDelete.id);
      setDepartmentToDelete(null);
    }
  };

  const handleCancelDelete = () => setDepartmentToDelete(null);

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <TabHeader
            title="Department Management"
            subtitle="Manage department information and configurations"
          />
          <Button type="button" onClick={handleAddClick} className="flex items-center gap-2 px-2.5 py-1.5 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover transition">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-between">
            <div className="relative">
              <div className="relative top-2">
                <TableColumnVisibility
                  columns={toggleableColumns}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={setVisibleColumns}
                />
              </div>
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
          key={selectedDepartment ? 'edit' : 'add'}
          isOpen={isFormModalOpen}
          onClose={handleModalClose}
          onSave={handleSaveDepartment}
          editingDepartment={selectedDepartment}
          existingDepartments={departments}
        />

        <DeleteConfirmationDialog
          isOpen={!!departmentToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete department?"
          description="This will permanently remove the department. This action cannot be undone."
          confirmButtonText="Delete Department"
          itemIds={departmentToDelete ? [departmentToDelete.id] : []}
          itemNames={departmentToDelete ? [departmentToDelete.name] : []}
          itemCount={departmentToDelete ? 1 : 0}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainDepartmentPage;
