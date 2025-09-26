import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "@/assets/icons";
import { cn } from "@/utils/utils";
import { Input } from "@/components/ui/components/Input";

interface SearchableDropdownItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableDropdownProps {
  items: SearchableDropdownItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  emptyMessage?: string;
}

export const SearchableDropdown = ({
  items,
  selectedId,
  onSelect,
  placeholder = "Select an option...",
  className,
  maxHeight = "max-h-60",
  emptyMessage = "No options found",
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find(item => item.id === selectedId);

  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.sublabel && item.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    onSelect(id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (event.key === "Enter" && filteredItems.length > 0) {
      handleSelect(filteredItems[0].id);
    }
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-outlineVariant bg-surface px-3 py-2 text-left text-sm hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
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
        <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-outlineVariant bg-surface shadow-lg">
          {/* Search Input */}
          <div className="p-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  onClick={() => handleSelect(item.id)}
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