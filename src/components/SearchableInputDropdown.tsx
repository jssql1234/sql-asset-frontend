import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "@/assets/icons";
import { cn } from "@/utils/utils";
import { Input } from "@/components/ui/components/Input";

interface DropdownOption {
  id: string;
  label: string;
}

interface SearchableInputDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options?: DropdownOption[];
  emptyMessage?: string;
  maxHeight?: number;
  position?: 'top' | 'bottom';
  showDropdown?: boolean;
  hideEmptyMessage?: boolean;
  defaultValue?: string;
}

const defOptions: DropdownOption[] = [];

const SearchableInputDropdown = ({
  value = "",
  onChange,
  placeholder = "Enter value",
  disabled = false,
  className,
  options = defOptions,
  emptyMessage = "No options found",
  maxHeight = 200,
  position = 'bottom',
  showDropdown = true,
  hideEmptyMessage = true,
  defaultValue,
}: SearchableInputDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Display all filtered options
  const displayedOptions = filteredOptions;

  // Set default value on initial load only
  useEffect(() => {
    if (defaultValue && !value && options.length > 0) {
      const defaultOption = options.find(option => option.id === defaultValue || option.label === defaultValue);
      if (defaultOption) {
        onChange(defaultOption.id);
      } else {
        // Fallback to first option if default value not found
        onChange(options[0].id);
      }
    }
  });

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
  }, [inputValue, value]);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchTerm(newValue);
    onChange(newValue);
    if (!isOpen && options.length > 0 && showDropdown) setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (showDropdown && options.length > 0) {
      setIsOpen(true);
      // Show full list on focus, don't filter by current value
      setSearchTerm("");
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    setInputValue(optionValue);
    setSearchTerm("");
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (event.key === "Enter" && displayedOptions.length > 0) {
      handleOptionSelect(displayedOptions[0].id);
    } else if (event.key === "ArrowDown" && !isOpen && options.length > 0 && showDropdown) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Close dropdown after a short delay to allow option selection
    setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Input Field with Dropdown Arrow */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          disabled={disabled}
          className="pr-10"
        />
        {options.length > 0 && showDropdown && (
          <button
            type="button"
            onClick={() => { setIsOpen(!isOpen); }}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-onSurfaceVariant transition-transform hover:text-onSurface"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        )}
      </div>

      {/* Dropdown Content */}
      {isOpen && options.length > 0 && showDropdown && (
        <div className={cn(
          "absolute z-50 w-full rounded-md border border-outlineVariant bg-surface shadow-lg",
          position === 'top' ? "bottom-full mb-1" : "top-full mt-1", 
          displayedOptions.length <= 0 && hideEmptyMessage ? "hidden" : ""
        )}>
          <div className="overflow-y-auto" style={{ maxHeight: `${String(maxHeight)}px` }}>
            {displayedOptions.length > 0 ? (
              displayedOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    handleOptionSelect(option.id);
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-surfaceContainerLowest focus:bg-surfaceContainerLowest focus:outline-none"
                >
                  <span className="font-medium">{option.label}</span>
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
};

export { SearchableInputDropdown };
export type { DropdownOption };