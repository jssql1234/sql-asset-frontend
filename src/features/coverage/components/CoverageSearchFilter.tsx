import React, { useMemo } from "react";
import SearchFilterBase, { type FilterConfig } from "@/components/SearchFilter";
import { Card } from "@/components/ui/components";
import { cn } from "@/utils/utils";
import type { ClaimFilters, InsuranceFilters, WarrantyFilters } from "@/features/coverage/types";

interface CoverageSearchFilterProps {
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

export const CoverageSearchFilter: React.FC<CoverageSearchFilterProps> = ({
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

interface InsuranceSearchFilterProps {
  filters: InsuranceFilters;
  providers: string[];
  onFiltersChange: (filters: Partial<InsuranceFilters>) => void;
}

export const InsuranceSearchFilter: React.FC<InsuranceSearchFilterProps> = ({
  filters,
  providers,
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
          { label: "Active", value: "Active" },
          { label: "Expiring Soon", value: "Expiring Soon" },
          { label: "Expired", value: "Expired" },
        ],
        onSelect: (value: string) => onFiltersChange({ status: value as InsuranceFilters["status"] }),
      },
      {
        id: "provider",
        label: "Provider",
        value: filters.provider,
        placeholder: "All Providers",
        options: [
          { label: "All Providers", value: "" },
          ...providers.map((provider) => ({ label: provider, value: provider })),
        ],
        onSelect: (value: string) => onFiltersChange({ provider: value }),
      },
    ],
    [filters.status, filters.provider, providers, onFiltersChange]
  );

  return (
    <CoverageSearchFilter
      searchLabel="Search"
      searchPlaceholder="Policy name, provider, or asset"
      searchValue={filters.search}
      onSearchChange={(value: string) => onFiltersChange({ search: value })}
      dropdowns={dropdowns}
      onClear={() =>
        onFiltersChange({
          search: "",
          status: "",
          provider: "",
        })
      }
    />
  );
};

interface WarrantySearchFilterProps {
  filters: WarrantyFilters;
  providers: string[];
  onFiltersChange: (filters: Partial<WarrantyFilters>) => void;
}

export const WarrantySearchFilter: React.FC<WarrantySearchFilterProps> = ({
  filters,
  providers,
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
          { label: "Active", value: "Active" },
          { label: "Expiring Soon", value: "Expiring Soon" },
          { label: "Expired", value: "Expired" },
        ],
        onSelect: (value: string) => onFiltersChange({ status: value as WarrantyFilters["status"] }),
      },
      {
        id: "provider",
        label: "Provider",
        value: filters.provider,
        placeholder: "All Providers",
        options: [
          { label: "All Providers", value: "" },
          ...providers.map((provider) => ({ label: provider, value: provider })),
        ],
        onSelect: (value: string) => onFiltersChange({ provider: value }),
      },
    ],
    [filters.status, filters.provider, providers, onFiltersChange]
  );

  return (
    <CoverageSearchFilter
      searchLabel="Search"
      searchPlaceholder="Warranty name, provider, or asset"
      searchValue={filters.search}
      onSearchChange={(value: string) => onFiltersChange({ search: value })}
      dropdowns={dropdowns}
      onClear={() =>
        onFiltersChange({
          search: "",
          status: "",
          provider: "",
        })
      }
    />
  );
};

interface ClaimSearchFilterProps {
  filters: ClaimFilters;
  onFiltersChange: (filters: Partial<ClaimFilters>) => void;
}

export const ClaimSearchFilter: React.FC<ClaimSearchFilterProps> = ({
  filters,
  onFiltersChange,
}) => {
  const dropdowns = useMemo(
    () => [
      {
        id: "type",
        label: "Claim Type",
        value: filters.type,
        placeholder: "All Types",
        options: [
          { label: "All Types", value: "" },
          { label: "Insurance", value: "Insurance" },
          { label: "Warranty", value: "Warranty" },
        ],
        onSelect: (value: string) => onFiltersChange({ type: value as ClaimFilters["type"] }),
      },
      {
        id: "status",
        label: "Status",
        value: filters.status,
        placeholder: "All Status",
        options: [
          { label: "All Status", value: "" },
          { label: "Filed", value: "Filed" },
          { label: "Approved", value: "Approved" },
          { label: "Settled", value: "Settled" },
          { label: "Rejected", value: "Rejected" },
        ],
        onSelect: (value: string) => onFiltersChange({ status: value as ClaimFilters["status"] }),
      },
    ],
    [filters.type, filters.status, onFiltersChange]
  );

  return (
    <CoverageSearchFilter
      searchLabel="Search"
      searchPlaceholder="Claim number, asset, or policy"
      searchValue={filters.search}
      onSearchChange={(value: string) => onFiltersChange({ search: value })}
      dropdowns={dropdowns}
      onClear={() =>
        onFiltersChange({
          search: "",
          type: "",
          status: "",
        })
      }
    />
  );
};