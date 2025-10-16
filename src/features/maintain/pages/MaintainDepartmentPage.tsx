import React from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import { DepartmentsSearchAndFilter } from '../components/DepartmentsSearchAndFilter';
import { DepartmentsTable } from '../components/DepartmentsTable';
import { DepartmentFormModal } from '../components/DepartmentFormModal';
import { useDepartments } from '../hooks/useDepartments';

const MaintainDepartmentPage: React.FC = () => {
  const {
    departments,
    filteredDepartments,
    selectedDepartments,
    filters,
    departmentTypes,
    isModalOpen,
    editingDepartment,
    setIsModalOpen,
    setEditingDepartment,
    updateFilters,
    toggleDepartmentSelection,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteMultipleDepartments,
    handleSaveDepartment,
  } = useDepartments();

  

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