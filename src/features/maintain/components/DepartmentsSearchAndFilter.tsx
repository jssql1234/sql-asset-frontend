import React from 'react';
import Search from '@/components/Search';
import type { DepartmentTypeOption, DepartmentsFilters } from '../types/departments';

interface DepartmentsSearchAndFilterProps {
  filters: DepartmentsFilters;
  onFiltersChange: (filters: Partial<DepartmentsFilters>) => void;
  departmentTypes: DepartmentTypeOption[];
}

export const DepartmentsSearchAndFilter: React.FC<DepartmentsSearchAndFilterProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <Search
        searchValue={filters.search}
        searchPlaceholder="Search departments by name, code, manager, or description..."
        onSearch={handleSearchChange}
        live
      />
    </div>
  );
};
