import React from "react";
import SearchBar from "@/components/SearchBar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Button } from "@/components/ui/components";
import type { FilterState } from "@/features/downtime/types";

interface DowntimeFiltersProps {
  filters: FilterState;
  onFiltersChange: (newFilters: Partial<FilterState>) => void;
}

const assetOptions: Array<{ value: string; label: string }> = [
  { value: "", label: "All Assets" },
  { value: "CBT-001", label: "Conveyor Belt A1" },
  { value: "PMP-002", label: "Pump System B2" },
  { value: "GEN-003", label: "Generator C3" },
];

const priorityOptions: Array<{ value: FilterState["priority"]; label: string }> = [
  { value: "", label: "All Priority" },
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" },
];

export const DowntimeFilters: React.FC<DowntimeFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const getSelectedAssetLabel = () => {
    const option = assetOptions.find(opt => opt.value === filters.asset);
    return option?.label || "All Assets";
  };

  const getSelectedPriorityLabel = () => {
    const option = priorityOptions.find(opt => opt.value === filters.priority);
    return option?.label || "All Priority";
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      asset: "",
      status: "",
      priority: "",
    });
  };

  return (
    <div className="flex flex-col gap-4 bg-surfaceContainer p-4 rounded-md border border-outline">
      
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="min-w-[220px] flex-1">
          <label className="body-small text-onSurface">Search</label>
          <SearchBar
            value={filters.search}
            onSearch={(value) => onFiltersChange({ search: value })}
            placeholder="Search incidents..."
            live={true}
          />
        </div>

        {/* Asset Filter */}
        <div className="flex flex-col gap-2">
          <label className="body-small text-onSurface">Asset</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger label={getSelectedAssetLabel()} className="w-full justify-between" />
            <DropdownMenuContent>
              {assetOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onFiltersChange({ asset: option.value })}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col gap-2">
          <label className="body-small text-onSurface">Priority</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger label={getSelectedPriorityLabel()} className="w-full justify-between" />
            <DropdownMenuContent>
              {priorityOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onFiltersChange({ priority: option.value })}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="outline" size="sm" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
};