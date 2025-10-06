import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/components/Input";
import { Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/components";
import { Search, X, Check } from "@/assets/icons";
import { cn } from "@/utils/utils";

type Primitive = string | number | boolean | null | undefined;

export interface FilterOption<TValue extends Primitive = string> {
  label: string;
  value: TValue;
  description?: string;
  disabled?: boolean;
}

export interface FilterConfig<TValue extends Primitive = string> {
  id: string; // Unique identifier for the filter. Used as the React key and data-testid hook.
  label: string; // Display label rendered above the dropdown trigger.
  value: TValue; // Currently selected value for the filter.
  placeholder?: string; // Placeholder text shown when no option is selected.
  options: Array<FilterOption<TValue>>; // Options rendered inside the dropdown menu.
  onSelect: (value: TValue, option: FilterOption<TValue>) => void; // Callback triggered when the user selects a new option.
  triggerClassName?: string; // Optional tailwind class names applied to the dropdown trigger button.
  menuClassName?: string; // Optional tailwind class names applied to the dropdown menu container.
  itemClassName?: string; // Optional tailwind class names applied to each dropdown item.
  minWidthClassName?: string; // Optional min-width utility class for the dropdown container.
}

export interface SearchFilterProps<TValue extends Primitive = string> {
  searchValue?: string; // Current search input value.
  searchPlaceholder?: string; // Placeholder text for the search input.
  searchLabel?: string; // Optional label rendered above the search input.
  onSearch: (value: string) => void; // Invoked when the user submits or updates the search term.
  live?: boolean; // Renders the search in "live" mode, triggering onSearch on every keystroke.
  disabled?: boolean; // Disables the search input and optional submit button.
  filters?: Array<FilterConfig<TValue>>; // Optional array of dropdown filter configurations.
  onClearFilters?: () => void; // Optional callback invoked when the Clear Filters button is pressed.
  clearLabel?: string; // Custom label for the Clear Filters button.
  hideClearButton?: boolean; // Controls whether the clear button is shown when an onClearFilters handler is provided.
  className?: string; // Tailwind class names applied to the outer wrapper.
  contentClassName?: string; // Tailwind class names applied to the inner flex container.
  inputWrapperClassName?: string; // Tailwind class names applied to the search input wrapper.
  inputClassName?: string; // Tailwind class names applied directly to the input element.
  showLiveSearchIcon?: boolean; // When true, renders the live search icon (magnifier) inside the input when in live mode.
  submitLabel?: string; // Optional submit button label for non-live mode.
  clearButtonClassName?: string; // Optional class names applied to the clear button.
}

const getSelectedLabel = <TValue extends Primitive>(filter: FilterConfig<TValue>) => {
  const selectedOption = filter.options.find((option) => option.value === filter.value);
  if (selectedOption) {
    return selectedOption.label;
  }
  return filter.placeholder ?? "All";
};

const getSelectedOption = <TValue extends Primitive>(filter: FilterConfig<TValue>) =>
  filter.options.find((option) => option.value === filter.value);

const SearchFilter = <TValue extends Primitive = string>(
  {
    searchValue = "",
    searchPlaceholder,
    searchLabel,
    onSearch,
    live = false,
    disabled = false,
    filters = [],
    onClearFilters,
    clearLabel,
    hideClearButton = false,
    className,
    contentClassName,
    inputWrapperClassName,
    inputClassName,
    showLiveSearchIcon = true,
    submitLabel,
    clearButtonClassName,
  }: SearchFilterProps<TValue>) => {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState(searchValue);

  useEffect(() => {
    setInternalValue(searchValue);
  }, [searchValue]);

  const handleClearSearch = () => {
    setInternalValue("");
    onSearch("");
  };

  const handleSearchSubmit = () => {
    onSearch(internalValue.trim());
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!live && event.key === "Enter") {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInternalValue(nextValue);
    if (live) {
      onSearch(nextValue.trim());
    }
  };

  const handleClearFilters = () => {
    const hadSearch = internalValue !== "";
    if (hadSearch) {
      handleClearSearch();
    }
    onClearFilters?.();
  };

  const shouldShowClearButton = Boolean(onClearFilters) && !hideClearButton;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className={cn("flex flex-wrap items-end gap-4", contentClassName)}>
        <div className={cn("flex-1 min-w-[220px]", inputWrapperClassName)}>
          {searchLabel ? (
            <label className="body-small mb-1 block text-onSurface">{searchLabel}</label>
          ) : null}

          <div className="flex w-full min-w-40">
            <div className="relative flex flex-1">
              <Input
                value={internalValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder || t("search")}
                className={cn(
                  "pr-10 h-[36px]",
                  !live && "rounded-l rounded-r-none",
                  inputClassName,
                )}
                disabled={disabled}
              />
              {internalValue ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
                  aria-label={t("common:clear", { defaultValue: "Clear" })}
                >
                  <X className="h-4 w-4 text-surfaceVariant" />
                </button>
              ) : (
                live && showLiveSearchIcon ? (
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-onSurfaceVariant" />
                ) : null
              )}
            </div>

            {!live && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSearchSubmit}
                disabled={disabled}
                className="flex items-center gap-1 p-2 rounded-l-none rounded-r"
              >
                <Search className="h-4 w-4" />
                {submitLabel}
              </Button>
            )}
          </div>
        </div>

        {filters.map((filter) => {
          const selectedOption = getSelectedOption(filter);
          const triggerLabel = getSelectedLabel(filter);
          const minWidth = filter.minWidthClassName ?? "min-w-[180px]";
          return (
            <div key={filter.id} className={cn("flex flex-col gap-2", minWidth)}>
              <label className="body-small text-onSurface">{filter.label}</label>
              <DropdownMenu className="w-full">
                <DropdownMenuTrigger
                  label={triggerLabel}
                  className={cn("w-full justify-between", filter.triggerClassName)}
                />
                <DropdownMenuContent className={cn("min-w-[200px]", filter.menuClassName)}>
                  {filter.options.map((option) => (
                    <DropdownMenuItem
                      key={String(option.value)}
                      onClick={() => {
                        if (!option.disabled) {
                          filter.onSelect(option.value, option);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between gap-2",
                        filter.itemClassName,
                        option.disabled && "opacity-60 cursor-not-allowed pointer-events-none",
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        {option.description ? (
                          <span className="text-xs text-onSurfaceVariant">{option.description}</span>
                        ) : null}
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 text-primary transition-opacity",
                          selectedOption?.value === option.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {shouldShowClearButton ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className={clearButtonClassName}
          >
            {clearLabel || t("common:clearFilters", { defaultValue: "Clear Filters" })}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default SearchFilter;
