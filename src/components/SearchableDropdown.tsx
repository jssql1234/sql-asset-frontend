import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "@/assets/icons";
import { cn } from "@/utils/utils";
import { Input } from "@/components/ui/components/Input";

interface SearchableDropdownItem {
  id: string;
  label: string;
  sublabel?: string;
}

// Common props
interface CommonProps {
  /** List of options */
  items: SearchableDropdownItem[];

  placeholder?: string;
  className?: string;
  maxHeight?: string;
  disabled?: boolean;

  emptyMessage?: string;
  hideEmptyMessage?: boolean;

  /** Force dropdown to open upward/downwards */
  position?: 'top' | 'bottom';
}

interface SearchProps extends CommonProps {

  /** Value for dropdown mode */
  selectedId?: string;
  /** Callback for dropdown selections */
  onSelect?: (id: string) => void;

  /** Mode selection, undefined for migrating */
  mode?: 'search';
}

interface SearchInDropdownProps extends CommonProps {

  /** Value for dropdown mode */
  selectedId?: string;
  /** Callback for dropdown selections */
  onSelect?: (id: string) => void;

  /** Mode selection, undefined for migrating */
  mode?: 'searchInDropdown';
}

interface FreeInputProps extends CommonProps {

  /** Value for free input mode */
  value?: string;
  /** Callback for free input changes */
  onChange?: (value: string) => void;

  /** Mode selection, undefined for migrating */
  mode?: 'freeInput';
}

type SearchableDropdownProps = SearchProps | SearchInDropdownProps | FreeInputProps;

export const SearchableDropdown = (props: SearchableDropdownProps) => {
  const {
    items,
    placeholder,
    className,
    maxHeight,
    disabled,
    emptyMessage,
    hideEmptyMessage,
    position,

    ...rest
  } = {
    placeholder : "Select an option...",
    maxHeight : "max-h-60",
    emptyMessage : "No options found",
    position : 'bottom',
    value : "",
    disabled : false,
    hideEmptyMessage : false,

    ...props
  };

  const mode = rest.mode ?? 'search';

  const selectedId = (mode === 'search' || mode === 'searchInDropdown') && 'selectedId' in rest ? rest.selectedId : undefined;
  const onSelect = (mode === 'search' || mode === 'searchInDropdown') && 'onSelect' in rest ? rest.onSelect : undefined;
  const value = mode === 'freeInput' && 'value' in rest ? rest.value : undefined;
  const onChange = mode === 'freeInput' && 'onChange' in rest ? rest.onChange : undefined;

  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(value ?? '');

  const selectedItem = selectedId ? items.find((item) => item.id === selectedId) : undefined;

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sublabel?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  useEffect(() => {
    if (mode === 'freeInput' && value !== inputValue) {
      setInputValue(value ?? '');
    }
  }, [inputValue, value, mode]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const handleSelect = (id: string) => {
    onSelect?.(id);
    setIsOpen(false);
    setSearchTerm("");
    if (mode === 'freeInput') {
      const selectedItem = items.find(item => item.id === id);
      if (selectedItem) {
        setInputValue(selectedItem.label);
        onChange?.(selectedItem.label);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (event.key === "Enter" && filteredItems.length > 0) {
      handleSelect(filteredItems[0].id);
    }
  };

  if (mode === 'searchInDropdown' || mode === 'freeInput') {
    // Search input mode or free input mode - always shows input field
    return (
      <div ref={dropdownRef} className={cn("relative", className)}>
        {/* Search Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={mode === 'freeInput' ? inputValue : searchTerm}
          onChange={(e) => {
            const newValue = e.target.value;
            if (mode === 'freeInput') {
              setInputValue(newValue);
              setSearchTerm(newValue);
              onChange?.(newValue);
            } else {
              setSearchTerm(newValue);
            }
            if (!isOpen && items.length > 0) setIsOpen(true);
          }}
          onFocus={() => {
            if (items.length > 0) {
              setIsOpen(true);
              if (mode !== 'freeInput') {
                setSearchTerm("");
              }
            }
          }}
          onKeyDown={handleKeyDown}
          className="w-full pr-10"
          disabled={disabled}
        />

        {/* Dropdown Arrow */}
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => { setIsOpen(!isOpen); }}
            disabled={disabled}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-onSurfaceVariant transition-transform hover:text-onSurface disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        )}

        {/* Dropdown Content */}
        {isOpen && items.length > 0 && (
          <div className={cn(
            "absolute z-50 w-full rounded-md border border-outlineVariant bg-surface shadow-lg",
            position === 'top' ? "bottom-full mb-1" : "top-full mt-1",
            filteredItems.length <= 0 && hideEmptyMessage ? "hidden" : ""
          )}>
            {/* Options List */}
            <div className={cn("overflow-y-auto", maxHeight)}>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { handleSelect(item.id); }}
                    className={cn(
                      "flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-surfaceContainerLowest focus:bg-surfaceContainerLowest focus:outline-none",
                      selectedId === item.id &&
                        "bg-primaryContainer text-onPrimaryContainer"
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-xs opacity-75">
                        {item.sublabel}
                      </span>
                    )}
                  </button>
                ))
              ) : !hideEmptyMessage ? (
                <div className="px-3 py-2 text-sm text-onSurfaceVariant">
                  {emptyMessage}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Button mode - shows selected item with dropdown
  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-outlineVariant bg-surface px-3 py-2 text-left text-sm hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-outlineVariant",
          isOpen && "border-primary ring-1 ring-primary"
        )}
      >
        <div className="flex flex-col">
          {selectedItem ? (
            <>
              <span className="font-medium text-onSurface">
                {selectedItem.label}
              </span>
              {selectedItem.sublabel && (
                <span className="text-xs text-onSurfaceVariant">
                  {selectedItem.sublabel}
                </span>
              )}
            </>
          ) : (
            <span className="text-onSurfaceVariant">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-onSurfaceVariant transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className={cn(
          "absolute z-50 w-full rounded-md border border-outlineVariant bg-surface shadow-lg",
          position === 'top' ? "bottom-full mb-1" : "top-full mt-1"
        )}>
          {/* Search Input */}
          <div className="p-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
              onKeyDown={handleKeyDown}
              className="text-sm"
            />
          </div>

          {/* Options List */}
          <div className={cn("overflow-y-auto", maxHeight)}>
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { handleSelect(item.id); }}
                  className={cn(
                    "flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-surfaceContainerLowest focus:bg-surfaceContainerLowest focus:outline-none",
                    selectedId === item.id &&
                      "bg-primaryContainer text-onPrimaryContainer"
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.sublabel && (
                    <span className="text-xs opacity-75">{item.sublabel}</span>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-onSurfaceVariant">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
