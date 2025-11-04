import React from 'react';
import Search from '@/components/Search';
import type { ServiceProviderTypeOption, ServiceProviderFilters } from '../types/serviceProvider';

interface ServiceProviderSearchAndFilterProps {
  filters: ServiceProviderFilters;
  onFiltersChange: (filters: Partial<ServiceProviderFilters>) => void;
  serviceProviderTypes: ServiceProviderTypeOption[];
}

export const ServiceProviderSearchAndFilter: React.FC<ServiceProviderSearchAndFilterProps> = ({
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
        searchPlaceholder="Search service provider by name, code, phone, or email..."
        onSearch={handleSearchChange}
        live
      />
    </div>
  );
};
