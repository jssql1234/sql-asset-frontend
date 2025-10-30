import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "@/assets/icons";
import { cn } from "@/utils/utils";
import { Input } from "@/components/ui/components/Input";
import { Badge } from "@/components/ui/components/Badge";
import Card from "@/components/ui/components/Card";

const EMPTY_SELECTION: readonly string[] = [];

interface SearchWithDropdownItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchWithDropdownProps {
  categories: SearchWithDropdownItem[];
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  items: SearchWithDropdownItem[];
  selectedIds?: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  emptyMessage?: string;
  hideSelectedField?: boolean;
  hideSearchField?: boolean;
  disable?: boolean;
}

// Helper function to render asset labels with styled IDs
const renderAssetLabel = (label: string) => {
  const idPattern = /^(.+?)\s*\(([^)]+)\)$/;
  const match = idPattern.exec(label);
  
  if (match) {
    const [, name, id] = match;
    return (
      <>
        {name} <span className="text-xs text-onSurfaceVariant">({id})</span>
      </>
    );
  }
  
  return label;
};

export const SearchWithDropdown = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  items,
  selectedIds,
  onSelectionChange,
  placeholder = "Search...",
  className,
  maxHeight = "max-h-60",
  emptyMessage = "No results found",
  hideSelectedField = false,
  hideSearchField = false,
  disable = false,
}: SearchWithDropdownProps) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const resolvedSelectedIds = selectedIds ?? EMPTY_SELECTION;
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId]
  );

  const categoryLabel = selectedCategory
    ? selectedCategory.label
    : categories[0]?.label ?? "All categories";

  const itemsById = useMemo(() => {
    const map = new Map<string, SearchWithDropdownItem>();
    items.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (resolvedSelectedIds.includes(item.id)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const labelMatch = item.label.toLowerCase().includes(normalizedSearch);
      const sublabelMatch = item.sublabel
        ?.toLowerCase()
        .includes(normalizedSearch);

      return labelMatch || Boolean(sublabelMatch);
    });
  }, [items, normalizedSearch, resolvedSelectedIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-close dropdown when no items are available (but only when an item is selected)
  const prevFilteredLengthRef = useRef<number>(filteredItems.length);
  
  useEffect(() => {
    // Close dropdown only when filtered items transition from having items to being empty
    // This happens when user selects the last available item
    if (isSearchDropdownOpen && filteredItems.length === 0 && prevFilteredLengthRef.current > 0) {
      setIsSearchDropdownOpen(false);
    }
    prevFilteredLengthRef.current = filteredItems.length;
  }, [filteredItems.length, isSearchDropdownOpen]);

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsCategoryDropdownOpen(false);
  };

  const handleItemClick = (itemId: string) => {
    const nextSelection = resolvedSelectedIds.includes(itemId)
      ? resolvedSelectedIds.filter((id) => id !== itemId)
      : [...resolvedSelectedIds, itemId];

    onSelectionChange(nextSelection);
    setSearchTerm("");
  };

  const handleCategoryDropdownToggle = () => {
    setIsCategoryDropdownOpen((prev) => !prev);
    setIsSearchDropdownOpen(false);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    setIsSearchDropdownOpen(true);
    setIsCategoryDropdownOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsSearchDropdownOpen(false);
      setIsCategoryDropdownOpen(false);
      searchInputRef.current?.blur();
    }
  };

  // Remove selected item
  const handleRemoveItem = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const nextSelection = resolvedSelectedIds.filter((id) => id !== itemId);
    onSelectionChange(nextSelection);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Search Bar Container */}
      {!hideSearchField && (
        <div ref={containerRef} className="relative flex items-center">
          {/* Category Dropdown (Single Select) */}
          <div className="relative">
            <button
              type="button"
              onClick={disable ? undefined : handleCategoryDropdownToggle}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 bg-surfaceContainerHigh text-onSurface rounded-l-lg border border-r-0 border-outlineVariant hover:bg-surfaceContainerHighest transition-colors whitespace-nowrap h-[42px]",
                isCategoryDropdownOpen && "bg-surfaceContainerHighest",
                { "opacity-50 cursor-not-allowed": disable }
              )}
            >
              <span className="label-large font-medium">{categoryLabel}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-onSurfaceVariant transition-transform",
                  isCategoryDropdownOpen && "rotate-180",
                  { "opacity-50": disable }
                )}
              />
            </button>

            {/* Category Dropdown List */}
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded-md border border-outlineVariant bg-surface shadow-lg">
                <div className={cn("overflow-y-auto", maxHeight)}>
                  {categories.map((category) => {
                    const selected = category.id === selectedCategoryId;
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          handleCategoryClick(category.id);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-surfaceContainerLowest transition-colors",
                          selected && "bg-primaryContainer/30"
                        )}
                      >
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "font-medium",
                              selected && "text-primary"
                            )}
                          >
                            {category.label}
                          </span>
                          {category.sublabel && (
                            <span className="text-xs text-onSurfaceVariant opacity-75">
                              {category.sublabel}
                            </span>
                          )}
                        </div>
                        {selected && (
                          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-primary">
                            <svg
                              className="w-2.5 h-2.5 text-onPrimary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Search Input (Multi-Select) */}
          <div className="flex-1 relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={
                disable
                  ? undefined
                  : (event) => {
                      setSearchTerm(event.target.value);
                    }
              }
              onFocus={disable ? undefined : handleSearchFocus}
              onKeyDown={disable ? undefined : handleKeyDown}
              className={cn(
                "w-full rounded-l-none border-outlineVariant focus:z-10 h-[42px]",
                { "opacity-50 cursor-not-allowed": disable }
              )}
            />

            {/* Search Dropdown List */}
            {isSearchDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-outlineVariant bg-surface shadow-lg">
                <div className={cn("overflow-y-auto", maxHeight)}>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          handleItemClick(item.id);
                        }}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-surfaceContainerLowest transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {renderAssetLabel(item.label)}
                          </span>
                          {item.sublabel && (
                            <span className="text-xs text-onSurfaceVariant opacity-75">
                              {item.sublabel}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-onSurfaceVariant">
                      {emptyMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Items Display */}
      {!hideSelectedField || resolvedSelectedIds.length > 0 ? (
        <Card className="bg-surfaceContainerLow/60 border border-outlineVariant/60 rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-onSurfaceVariant">
              {/* <Badge
                text={`selected ${String(resolvedSelectedIds.length)} items`}
                variant="primary"
                className="px-2 py-1 text-xs"
              /> */}
              Selected {resolvedSelectedIds.length}{" "}
              {resolvedSelectedIds.length === 1 ? "item" : "items"}
            </div>
            {!disable && resolvedSelectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onSelectionChange([]);
                }}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {resolvedSelectedIds.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-outlineVariant/50 bg-surfaceContainerLowest px-4 py-6 text-sm text-onSurfaceVariant">
              Use the search above to add items to this list.
            </div>
          ) : (
            <div className="max-h-34 overflow-y-auto">
              <ul className="grid gap-2 sm:grid-cols-2">
                {resolvedSelectedIds.map((id) => {
                  const item = itemsById.get(id);
                  return (
                    <li
                      key={id}
                      className="group relative rounded-lg border border-outlineVariant/60 bg-surfaceContainerHighest px-3 py-2 transition-all hover:border-primary/70 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-onSurface">
                            {renderAssetLabel(item?.label ?? id)}
                          </span>
                          {item?.sublabel && (
                            <span className="text-xs text-onSurfaceVariant mt-1">
                              {item.sublabel}
                            </span>
                          )}
                        </div>
                        {!disable && (
                          <button
                            type="button"
                            onClick={(event) => {
                              handleRemoveItem(id, event);
                            }}
                            className="rounded-full p-1 text-onSurfaceVariant transition-colors hover:bg-primary/15 hover:text-primary"
                            aria-label={`Remove ${item?.label ?? id}`}
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="red"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
};

export default SearchWithDropdown;
