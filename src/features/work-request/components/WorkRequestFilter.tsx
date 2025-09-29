import { useMemo } from "react";
import { Input } from "@/components/ui/components/Input";
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, FilterChip, } from "@/components/ui/components";
import type { WorkRequestFilters, WorkRequest } from "@/types/work-request";

export interface FilterOptions {
  departments: string[];
  requesters: string[];
  statuses: WorkRequest['status'][];
  types: WorkRequest['requestType'][];
}

interface WorkRequestFilterProps {
  filters: WorkRequestFilters;
  options: FilterOptions;
  onFilterChange: (filters: WorkRequestFilters) => void;
  onResetFilters: () => void;
}

const WorkRequestFilter: React.FC<WorkRequestFilterProps> = ({
  filters,
  options,
  onFilterChange,
  onResetFilters,
}) => {
  const setFilter = (key: keyof WorkRequestFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const activeFilters = useMemo(
    () =>
      [
        filters.status && {
          key: "status" as const,
          label: `Status: ${filters.status}`,
        },
        filters.type && {
          key: "type" as const,
          label: `Type: ${filters.type}`,
        },
        filters.department && {
          key: "department" as const,
          label: `Department: ${filters.department}`,
        },
        filters.requester && {
          key: "requester" as const,
          label: `Requester: ${filters.requester}`,
        },
      ].filter(Boolean) as { key: keyof WorkRequestFilters; label: string }[],
    [filters]
  );

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-outline bg-surfaceContainer p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="body-small text-onSurface" htmlFor="work-request-search">
            Search
          </label>
          <Input
            id="work-request-search"
            placeholder="Search by request ID, description, or asset"
            value={filters.search}
            onChange={(event) => setFilter("search", event.target.value)}
          />
        </div>

        <FilterDropdown
          label="Status"
          value={filters.status}
          placeholder="All Status"
          options={options.statuses}
          onChange={(value) => setFilter("status", value as WorkRequest['status'] | "")}
        />

        <FilterDropdown
          label="Type"
          value={filters.type}
          placeholder="All Types"
          options={options.types}
          onChange={(value) => setFilter("type", value as WorkRequest['requestType'] | "")}
        />

        <FilterDropdown
          label="Department"
          value={filters.department}
          placeholder="All Departments"
          options={options.departments}
          onChange={(value) => setFilter("department", value)}
        />

        <FilterDropdown
          label="Requester"
          value={filters.requester}
          placeholder="All Requesters"
          options={options.requesters}
          onChange={(value) => setFilter("requester", value)}
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
  options: (string | WorkRequest['status'] | WorkRequest['requestType'])[];
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

export default WorkRequestFilter;