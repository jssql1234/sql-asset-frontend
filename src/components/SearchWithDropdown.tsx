import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "@/assets/icons";
import { cn } from "@/utils/utils";
import { Input } from "@/components/ui/components/Input";
import { Badge } from "@/components/ui/components/Badge";
import Card from "@/components/ui/components/Card";

interface SearchWithDropdownItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchWithDropdownProps {
  // Category dropdown props
  categories: SearchWithDropdownItem[];
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  
  // Search multi-select props
  items: SearchWithDropdownItem[];
  selectedIds?: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  emptyMessage?: string;
  hideSelectedField?: boolean;
}

export const SearchWithDropdown = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  items,
  selectedIds = [],
  onSelectionChange,
  placeholder = "Search...",
  className,
  maxHeight = "max-h-60",
  emptyMessage = "No results found",
  hideSelectedField = false,
}: SearchWithDropdownProps) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get selected category label
  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
  const categoryLabel = selectedCategory?.label || categories[0]?.label || "All categories";

  // Filter items based on search term and remove selected items
  const filteredItems = items.filter(
    (item) =>
      !selectedIds.includes(item.id) && // Remove selected items from dropdown
      (item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sublabel && item.sublabel.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle category selection (single select, closes dropdown)
  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    setIsCategoryDropdownOpen(false);
  };

  // Toggle item selection (multi-select)
  const handleItemClick = (itemId: string) => {
    const newSelectedIds = selectedIds.includes(itemId)
      ? selectedIds.filter((id) => id !== itemId)
      : [...selectedIds, itemId];
    
    onSelectionChange(newSelectedIds);
  };

  // Handle category dropdown toggle
  const handleCategoryDropdownToggle = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
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
    const newSelectedIds = selectedIds.filter((id) => id !== itemId);
    onSelectionChange(newSelectedIds);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Search Bar Container */}
      <div ref={containerRef} className="relative flex items-center">
        {/* Category Dropdown (Single Select) */}
        <div className="relative">
          <button
            type="button"
            onClick={handleCategoryDropdownToggle}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 bg-surfaceContainerHigh text-onSurface rounded-l-lg border border-r-0 border-outlineVariant hover:bg-surfaceContainerHighest transition-colors whitespace-nowrap h-[42px]",
              isCategoryDropdownOpen && "bg-surfaceContainerHighest"
            )}
          >
            <span className="label-large font-medium">{categoryLabel}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-onSurfaceVariant transition-transform",
                isCategoryDropdownOpen && "rotate-180"
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
                      onClick={() => handleCategoryClick(category.id)}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-surfaceContainerLowest transition-colors",
                        selected && "bg-primaryContainer/30"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className={cn("font-medium", selected && "text-primary")}>
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
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
            className="w-full rounded-l-none border-outlineVariant focus:z-10 h-[42px]"
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
                      onClick={() => handleItemClick(item.id)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-surfaceContainerLowest transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.label}
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

      {/* Selected Items Display */}
        {hideSelectedField || selectedIds.length > 0 ? (
          <Card className="bg-surfaceContainerLowest p-3 ">
            {/* Header with Clear all button */}
            <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-onSurfaceVariant">
              {selectedIds.length} item{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              type="button"
              onClick={() => onSelectionChange([])}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Clear all
            </button>
            </div>
            {/* Selected items chips */}
            <div className="flex flex-wrap gap-2">
            {selectedIds.map((id) => {
              const item = items.find((i) => i.id === id);
              if (!item) return null;
              
              return (
                <div key={id} className="relative group">
                <Badge
                  text={item.label}
                  variant="primary"
                  className="pr-8"
                />
                <button
                  type="button"
                  onClick={(e) => handleRemoveItem(id, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${item.label}`}
                >
                  <svg
                    className="w-3.5 h-3.5 text-error"
                    fill="none"
                    stroke="currentColor"
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
                </div>
              );
            })}
            </div>
          </Card>
        ) : null}
          

    </div>
  );
};

export default SearchWithDropdown;
