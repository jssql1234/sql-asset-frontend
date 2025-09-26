import { useMemo } from "react";
import { Input } from "@/components/ui/components/Input";
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, FilterChip, } from "@/components/ui/components";
import type { AllocationFilters, AssetStatus } from "../types";

export interface FilterOptions {
  locations: string[];
  pics: string[];
  statuses: AssetStatus[];
}

interface AllocationFilterProps {
  filters: AllocationFilters;
  options: FilterOptions;
  onFilterChange: (filters: AllocationFilters) => void;
  onResetFilters: () => void;
}

const AllocationFilter: React.FC<AllocationFilterProps> = ({
  filters,
  options,
  onFilterChange,
  onResetFilters,
}) => {
  const setFilter = (key: keyof AllocationFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilters = useMemo(
    () =>
      [
        filters.location && {
          key: "location" as const,
          label: `Location: ${filters.location}`,
        },
        filters.pic && {
          key: "pic" as const,
          label: `PIC: ${filters.pic}`,
        },
        filters.status && {
          key: "status" as const,
          label: `Status: ${filters.status}`,
        },
      ].filter(Boolean) as { key: keyof AllocationFilters; label: string }[],
    [filters]
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-outline bg-surfaceContainer p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="body-small text-onSurface" htmlFor="allocation-search">
            Search
          </label>
          <Input
            id="allocation-search"
            placeholder="Search by asset, status, or location"
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
          />
        </div>

        <FilterDropdown
          label="Location"
          value={filters.location}
          placeholder="All Locations"
          options={options.locations}
          onChange={(value) => setFilter("location", value)}
        />

        <FilterDropdown
          label="PIC"
          value={filters.pic}
          placeholder="All PICs"
          options={options.pics}
          onChange={(value) => setFilter("pic", value)}
        />

        <FilterDropdown
          label="Status"
          value={filters.status}
          placeholder="All Status"
          options={options.statuses}
          onChange={(value) => setFilter("status", value as string)}
        />

        <Button variant="outline" size="sm" onClick={onResetFilters}>
          Clear Filters
        </Button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="body-small text-onSurfaceVariant">Active:</span>
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.key}
              selected
              className="px-3 py-1"
              onChange={(checked) => {
                if (!checked) {
                  setFilter(filter.key, "");
                }
              }}
            >
              {filter.label}
            </FilterChip>
          ))}
          <Button variant="link" size="sm" onClick={onResetFilters}>
            Reset all
          </Button>
        </div>
      )}
    </div>
  );
};

interface FilterDropdownProps {
  label: string;
  value: string;
  placeholder: string;
  options: (string | number | AssetStatus)[];
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  placeholder,
  options,
  onChange,
}) => {
  return (
    <div className="flex min-w-[180px] flex-col gap-1">
      <label className="body-small text-onSurface">{label}</label>
      <DropdownMenu className="w-full">
        <DropdownMenuTrigger
          label={value || placeholder}
          className="w-full justify-between"
        />
        <DropdownMenuContent matchTriggerWidth disablePortal>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onChange(next)}
          >
            <DropdownMenuRadioItem value="">
              {placeholder}
            </DropdownMenuRadioItem>
            {options.map((option) => (
              <DropdownMenuRadioItem key={String(option)} value={String(option)}>
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AllocationFilter;
