import React from 'react';
import Search from '@/components/Search';
import { Button } from '@/components/ui/components';

interface AssetGroupsSearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

const AssetGroupsSearchAndFilter: React.FC<AssetGroupsSearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  onClearFilters
}) => {
  const hasFilters = Boolean(searchValue);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Search
          searchValue={searchValue}
          searchPlaceholder="Search asset groups by code, name, or description..."
          onSearch={onSearchChange}
          live
          className="flex-1"
          inputClassName="h-10"
        />

        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="sm:w-auto w-full"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default AssetGroupsSearchAndFilter;
