import React from 'react';
import Search from '@/components/Search';
import type { SparePart, SparePartsFilters } from '../types/spareParts';
import { getUniqueCategories, getUniqueStatuses } from '../utils/sparePartsUtils';

interface SparePartsSearchAndFilterProps {
  filters: SparePartsFilters;
  onFiltersChange: (filters: Partial<SparePartsFilters>) => void;
  spareParts: SparePart[];
}

export const SparePartsSearchAndFilter: React.FC<SparePartsSearchAndFilterProps> = ({
  filters,
  onFiltersChange,
  spareParts,
}) => {
  const categories = getUniqueCategories(spareParts);
  const statuses = getUniqueStatuses(spareParts);

  const handleSearchChange = (searchValue: string) => {
    onFiltersChange({ search: searchValue });
  };

  const handleCategoryChange = (categoryValue: string) => {
    onFiltersChange({ category: categoryValue });
  };

  const handleStatusChange = (statusValue: string) => {
    onFiltersChange({ status: statusValue });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Search
        searchValue={filters.search}
        searchPlaceholder="Search parts by name, ID, or description..."
        onSearch={handleSearchChange}
        live
      />

      {/* Filter Bar */}
      <div className="flex gap-4 items-center">
        {/* Category Filter */}
        <div className="flex items-center gap-2 min-w-0">
          <label htmlFor="categoryFilter" className="text-sm font-medium text-onSurface whitespace-nowrap">
            Category:
          </label>
          <select
            id="categoryFilter"
            value={filters.category}
            onChange={(e) => { handleCategoryChange(e.target.value); }}
            className="px-3 py-2 border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-32"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 min-w-0">
          <label htmlFor="statusFilter" className="text-sm font-medium text-onSurface whitespace-nowrap">
            Status:
          </label>
          <select
            id="statusFilter"
            value={filters.status}
            onChange={(e) => { handleStatusChange(e.target.value); }}
            className="px-3 py-2 border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-32"
          >
            <option value="">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Results Info */}
        <div className="flex-1 text-sm text-onSurfaceVariant">
          {spareParts.length} total parts
        </div>
      </div>
    </div>
  );
};
