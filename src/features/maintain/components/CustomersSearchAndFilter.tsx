import React from 'react';
import Search from '@/components/Search';
import type {CustomersFilters } from '../types/customers';


interface CustomersSearchAndFilterProps {
  filters: CustomersFilters;
  onFiltersChange: (filters: Partial<CustomersFilters>) => void;
}

export const CustomersSearchAndFilter: React.FC<CustomersSearchAndFilterProps> = ({
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
        searchPlaceholder="Search customers by name, code, contact person, or email..."
        onSearch={handleSearchChange}
        live
      />
    </div>
  );
};
