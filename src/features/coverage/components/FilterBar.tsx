import React from "react";
import SearchBar from "@/components/SearchBar";
import {
  Button,
  Card,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/components";
import { cn } from "@/utils/utils";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownConfig {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
}

interface FilterBarProps {
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  dropdowns?: DropdownConfig[];
  onClear?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  dropdowns = [],
  onClear,
  className,
}) => {
  const renderDropdownTriggerLabel = (dropdown: DropdownConfig) => {
    const selectedOption = dropdown.options.find((option) => option.value === dropdown.value);
    return selectedOption?.label ?? dropdown.placeholder;
  };

  return (
    <Card
      className={cn(
        "mt-0 flex flex-col gap-4 border border-outline bg-surfaceContainer p-4",
        className
      )}
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="body-small text-onSurface">{searchLabel}</label>
          <SearchBar
            value={searchValue}
            onSearch={onSearchChange}
            placeholder={searchPlaceholder}
            live
          />
        </div>

        {dropdowns.map((dropdown) => (
          <div key={dropdown.id} className="flex flex-col gap-2 min-w-[180px]">
            <label className="body-small text-onSurface">{dropdown.label}</label>
            <DropdownMenu className="w-full">
              <DropdownMenuTrigger
                label={renderDropdownTriggerLabel(dropdown)}
                className="w-full justify-between"
              />
              <DropdownMenuContent className="min-w-[200px]">
                {dropdown.options.map((option) => (
                  <DropdownMenuItem
                    key={option.value || "__all"}
                    onClick={() => dropdown.onSelect(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {onClear && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear Filters
          </Button>
        )}
      </div>
    </Card>
  );
};
