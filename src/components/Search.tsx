import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/components/Input";
import { Button } from "@/components/ui/components";
import { Search as SearchIcon, X } from "@/assets/icons";
import { cn } from "@/utils/utils";

export interface SearchProps {
  searchValue?: string; // Current search input value.
  searchPlaceholder?: string; // Placeholder text for the search input.
  searchLabel?: string; // Optional label rendered above the search input.
  onSearch: (value: string) => void; // Invoked when the user submits or updates the search term.
  live?: boolean; // Renders the search in "live" mode, triggering onSearch on every keystroke.
  disabled?: boolean; // Disables the search input and optional submit button.
  className?: string; // Tailwind class names applied to the outer wrapper.
  inputClassName?: string; // Tailwind class names applied directly to the input element.
  showLiveSearchIcon?: boolean; // When true, renders the live search icon (magnifier) inside the input when in live mode.
  submitLabel?: string; // Optional submit button label for non-live mode.
}

const Search: React.FC<SearchProps> = ({
  searchValue = "",
  searchPlaceholder,
  searchLabel,
  onSearch,
  live = false,
  disabled = false,
  className,
  inputClassName,
  showLiveSearchIcon = true,
  submitLabel,
}) => {
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

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {searchLabel ? (
        <label className="body-small text-onSurface">{searchLabel}</label>
      ) : null}

      <div className="flex w-full">
        <div className="relative flex flex-1">
          <Input
            value={internalValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder ?? t("search")}
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
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-onSurfaceVariant" />
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
            <SearchIcon className="h-4 w-4" />
            {submitLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Search;
