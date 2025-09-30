import React from "react";
import SearchFilterBase, { type FilterConfig } from "@/components/SearchFilter";
import { Card } from "@/components/ui/components";
import { cn } from "@/utils/utils";

interface SearchFilterProps {
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  dropdowns?: Array<{
    id: string;
    label: string;
    value: string;
    placeholder: string;
    options: Array<{ label: string; value: string }>;
    onSelect: (value: string) => void;
  }>;
  onClear?: () => void;
  className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  dropdowns = [],
  onClear,
  className,
}) => {
  const dropdownFilters: FilterConfig<string>[] = (dropdowns ?? []).map((dropdown) => ({
    id: dropdown.id,
    label: dropdown.label,
    value: dropdown.value,
    placeholder: dropdown.placeholder,
    options: dropdown.options,
    onSelect: (value) => dropdown.onSelect(value),
  }));

  return (
    <Card
      className={cn(
        "mt-0 flex flex-col gap-4 border border-outline bg-surfaceContainer p-4",
        className
      )}
    >
      <SearchFilterBase
        searchLabel={searchLabel}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearch={onSearchChange}
        live
        filters={dropdownFilters}
        onClearFilters={onClear}
        clearLabel="Clear Filters"
        className="gap-0"
      />
    </Card>
  );
};
