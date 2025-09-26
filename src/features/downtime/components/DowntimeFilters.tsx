import React from "react";
import SearchBar from "@/components/SearchBar";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/components";
import type { FilterState } from "../types/downtime";

interface DowntimeFiltersProps {
  filters: FilterState;
  onFiltersChange: (newFilters: Partial<FilterState>) => void;
}

const assetOptions = [
  { value: "", label: "All Assets" },
  { value: "CBT-001", label: "Conveyor Belt A1" },
  { value: "PMP-002", label: "Pump System B2" },
  { value: "GEN-003", label: "Generator C3" },
];

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

const priorityOptions = [
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

  const getSelectedStatusLabel = () => {
    const option = statusOptions.find(opt => opt.value === filters.status);
    return option?.label || "All Status";
  };

  const getSelectedPriorityLabel = () => {
    const option = priorityOptions.find(opt => opt.value === filters.priority);
    return option?.label || "All Priority";
  };

  return (
    <div className="flex flex-col gap-4 bg-surfaceContainer p-4 rounded-md border border-outline">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="flex flex-col gap-2">
          <label className="label-medium text-onSurface">Search</label>
          <SearchBar
            value={filters.search}
            onSearch={(value) => onFiltersChange({ search: value })}
            placeholder="Search incidents..."
            live={true}
          />
        </div>

        {/* Asset Filter */}
        <div className="flex flex-col gap-2">
          <label className="label-medium text-onSurface">Asset</label>
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

        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <label className="label-medium text-onSurface">Status</label>
          <DropdownMenu className="w-full">
            <DropdownMenuTrigger label={getSelectedStatusLabel()} className="w-full justify-between" />
            <DropdownMenuContent>
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onFiltersChange({ status: option.value })}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col gap-2">
          <label className="label-medium text-onSurface">Priority</label>
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
      </div>
    </div>
  );
};