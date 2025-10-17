import React from 'react';
import Search from '@/components/Search';
import type { SparePartsFilters } from '../types/spareParts';

interface SparePartsSearchAndFilterProps {
  filters: SparePartsFilters;
  onFiltersChange: (filters: Partial<SparePartsFilters>) => void;
}

export const SparePartsSearchAndFilter: React.FC<SparePartsSearchAndFilterProps> = ({
  filters,
  onFiltersChange,
}) => {

  const handleSearchChange = (searchValue: string) => {
    onFiltersChange({ search: searchValue });
  };

  return (
    <div>
      {/* Search Bar */}
      <Search
        searchValue={filters.search}
        searchPlaceholder="Search parts by name, ID, or description..."
        onSearch={handleSearchChange}
        live
      />
    </div>
  );
};
