import React, { useMemo } from "react";
import SearchFilterBase, { type FilterConfig } from "@/components/SearchFilter";
import { Card } from "@/components/ui/components";
import { cn } from "@/utils/utils";
import type { AllocationFilters, RentalFilters, AssetStatus, RentalStatus } from "../types";

interface AllocationSearchFilterProps {
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

export const AllocationSearchFilter: React.FC<AllocationSearchFilterProps> = ({
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  dropdowns = [],
  onClear,
  className,
}) => {
  const dropdownFilters: FilterConfig<string>[] = dropdowns.map((dropdown) => ({
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

interface AllocationFilterProps {
  filters: AllocationFilters;
  locations: string[];
  pics: string[];
  statuses: AssetStatus[];
  onFiltersChange: (filters: Partial<AllocationFilters>) => void;
}

export const AllocationFilter: React.FC<AllocationFilterProps> = ({
  filters,
  locations,
  pics,
  statuses,
  onFiltersChange,
}) => {
  const dropdowns = useMemo(
    () => [
      {
        id: "location",
        label: "Location",
        value: filters.location,
        placeholder: "All Locations",
        options: [
          { label: "All Locations", value: "" },
          ...locations.map((location) => ({ label: location, value: location })),
        ],
        onSelect: (value: string) => onFiltersChange({ location: value }),
      },
      {
        id: "pic",
        label: "PIC",
        value: filters.pic,
        placeholder: "All PICs",
        options: [
          { label: "All PICs", value: "" },
          ...pics.map((pic) => ({ label: pic, value: pic })),
        ],
        onSelect: (value: string) => onFiltersChange({ pic: value }),
      },
      {
        id: "status",
        label: "Status",
        value: filters.status,
        placeholder: "All Status",
        options: [
          { label: "All Status", value: "" },
          ...statuses.map((status) => ({ label: status, value: status })),
        ],
        onSelect: (value: string) => onFiltersChange({ status: value as AssetStatus | "" }),
      },
    ],
    [filters.location, filters.pic, filters.status, locations, pics, statuses, onFiltersChange]
  );

  return (
    <AllocationSearchFilter
      searchLabel="Search"
      searchPlaceholder="Search by asset, status, or location"
      searchValue={filters.search}
      onSearchChange={(value: string) => onFiltersChange({ search: value })}
      dropdowns={dropdowns}
      onClear={() =>
        onFiltersChange({
          search: "",
          location: "",
          pic: "",
          status: "",
        })
      }
    />
  );
};

interface RentalFilterProps {
  filters: RentalFilters;
  statuses: RentalStatus[];
  locations: string[];
  onFiltersChange: (filters: Partial<RentalFilters>) => void;
}

export const RentalFilter: React.FC<RentalFilterProps> = ({
  filters,
  statuses,
  locations,
  onFiltersChange,
}) => {
  const dropdowns = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        value: filters.status,
        placeholder: "All Status",
        options: [
          { label: "All Status", value: "" },
          ...statuses.map((status) => ({ label: status, value: status })),
        ],
        onSelect: (value: string) => onFiltersChange({ status: value as RentalStatus | "" }),
      },
      {
        id: "location",
        label: "Location",
        value: filters.location,
        placeholder: "All Locations",
        options: [
          { label: "All Locations", value: "" },
          ...locations.map((location) => ({ label: location, value: location })),
        ],
        onSelect: (value: string) => onFiltersChange({ location: value }),
      },
    ],
    [filters.status, filters.location, statuses, locations, onFiltersChange]
  );

  return (
    <AllocationSearchFilter
      searchLabel="Search"
      searchPlaceholder="Search by asset, customer, or status"
      searchValue={filters.search}
      onSearchChange={(value: string) => onFiltersChange({ search: value })}
      dropdowns={dropdowns}
      onClear={() =>
        onFiltersChange({
          search: "",
          status: "",
          location: "",
        })
      }
    />
  );
};
