import React from 'react';
import Search from '@/components/Search';
import type { LocationsFilters, LocationTypeOption } from '../types/locations';

interface LocationsSearchAndFilterProps {
  filters: LocationsFilters;
  onFiltersChange: (filters: Partial<LocationsFilters>) => void;
  locationTypes: LocationTypeOption[];
}

export const LocationsSearchAndFilter: React.FC<LocationsSearchAndFilterProps> = ({
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
        searchPlaceholder="Search locations by name, ID, address, or contact..."
        onSearch={handleSearchChange}
        live
      />
    </div>
  );
};
