import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import { useToast } from '@/components/ui/components/Toast/useToast';
import { DepartmentsSearchAndFilter } from '../components/DepartmentsSearchAndFilter';
import { DepartmentsTable } from '../components/DepartmentsTable';
import { DepartmentFormModal } from '../components/DepartmentFormModal';
import { useDepartments } from '../hooks/useDepartments';
import type { Department, DepartmentFormData } from '../types/departments';

const MaintainDepartmentPage: React.FC = () => {
  const {
    departments,
    filteredDepartments,
    selectedDepartments,
    filters,
    departmentTypes,
    updateFilters,
    addDepartment,
    updateDepartment,
    deleteMultipleDepartments,
    toggleDepartmentSelection,
  } = useDepartments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const { addToast } = useToast();

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleSaveDepartment = (formData: DepartmentFormData) => {
    try {
      if (editingDepartment) {
        updateDepartment(formData);
        addToast({
          title: 'Success',
          description: 'Department updated successfully!',
          variant: 'success',
        });
      } else {
        addDepartment(formData);
        addToast({
          title: 'Success',
          description: 'Department added successfully!',
          variant: 'success',
        });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while saving the department.',
        variant: 'error',
      });
      throw error;
    }
  };

  const handleDeleteMultipleDepartments = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    if (confirm(`Are you sure you want to delete ${String(ids.length)} selected departments?`)) {
      try {
        deleteMultipleDepartments(ids);
        addToast({
          title: 'Success',
          description: `${String(ids.length)} departments deleted successfully!`,
          variant: 'success',
        });
      } catch (error) {
        addToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred while deleting the departments.',
          variant: 'error',
        });
      }
    }
  };

  return (
    <SidebarHeader
      breadcrumbs={[
        { label: 'Tools' },
        { label: 'Maintain Department' },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Department Management"
          subtitle="Manage department information and configurations"
        />

        <DepartmentsSearchAndFilter
          filters={filters}
          onFiltersChange={updateFilters}
          departmentTypes={departmentTypes}
        />

        <div className="flex-1 overflow-hidden">
          <DepartmentsTable
            departments={filteredDepartments}
            departmentTypes={departmentTypes}
            selectedDepartments={selectedDepartments}
            onToggleSelection={toggleDepartmentSelection}
            onAddDepartment={handleAddDepartment}
            onEditDepartment={handleEditDepartment}
            onDeleteMultipleDepartments={handleDeleteMultipleDepartments}
          />
        </div>

        <DepartmentFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingDepartment(null);
          }}
          onSave={handleSaveDepartment}
          editingDepartment={editingDepartment}
          existingDepartments={departments}
          departmentTypes={departmentTypes}
        />
      </div>
    </SidebarHeader>
  );
};

export default MaintainDepartmentPage;