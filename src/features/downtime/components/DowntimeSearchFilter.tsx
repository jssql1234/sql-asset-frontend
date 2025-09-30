import React from "react";
import SearchFilterBase from "@/components/SearchFilter";
import type { FilterState } from "@/features/downtime/types";

interface DowntimeSearchFilterProps {
  filters: FilterState;
  onFiltersChange: (newFilters: Partial<FilterState>) => void;
}

const ASSET_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All Assets" },
  { value: "CBT-001", label: "Conveyor Belt A1" },
  { value: "PMP-002", label: "Pump System B2" },
  { value: "GEN-003", label: "Generator C3" },
];

const PRIORITY_OPTIONS: Array<{ value: FilterState["priority"]; label: string }> = [
  { value: "", label: "All Priority" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

const STATUS_OPTIONS: Array<{ value: FilterState["status"]; label: string }> = [
  { value: "", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

export const DowntimeSearchFilter: React.FC<DowntimeSearchFilterProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      asset: "",
      status: "",
      priority: "",
    });
  };

  const downtimeFilterConfigs = [
    {
      id: "asset",
      label: "Asset",
      value: filters.asset,
      placeholder: "All Assets",
      options: ASSET_OPTIONS,
      onSelect: (value: string) => onFiltersChange({ asset: value }),
    },
    {
      id: "priority",
      label: "Priority",
      value: filters.priority,
      placeholder: "All Priority",
      options: PRIORITY_OPTIONS,
      onSelect: (value: string) => onFiltersChange({ priority: value as FilterState["priority"] }),
    },
    {
      id: "status",
      label: "Status",
      value: filters.status,
      placeholder: "All Status",
      options: STATUS_OPTIONS,
      onSelect: (value: string) => onFiltersChange({ status: value as FilterState["status"] }),
    },
  ];

  return (
    <div className="flex flex-col gap-4 bg-surfaceContainer p-4 rounded-md border border-outline">
      <SearchFilterBase
        searchLabel="Search"
        searchPlaceholder="Search incidents..."
        searchValue={filters.search}
        onSearch={(value) => onFiltersChange({ search: value })}
        live
        filters={downtimeFilterConfigs}
        onClearFilters={handleClearFilters}
        clearLabel="Clear Filters"
      />
    </div>
  );
};

export default DowntimeSearchFilter;
