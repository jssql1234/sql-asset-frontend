import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/components";
import { ChevronDown, PointFilled } from "@/assets/icons";
import { cn } from "@/utils/utils";
import {
  useDropdownPosition,
  getTransformOrigin,
  getOriginClass,
} from "@/components/ui/utils";

interface SelectDropdownOption {
  value: string;
  label: React.ReactNode;
}

interface SelectDropdownProps {
  value?: string | null;
  onChange: (value: string) => void;
  options: SelectDropdownOption[];
  placeholder?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  contentClassName?: string;
  matchTriggerWidth?: boolean;
  icon?: React.ReactNode;
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  buttonSize?: React.ComponentProps<typeof Button>["size"];
  showRadio?: boolean; // Optional: Show radio button indicators
}

// Default styles matching DropdownButton
const DROPDOWN_STYLES = {
  content: {
    base: "z-20 absolute overflow-auto bg-surfaceContainerHighest border border-outline rounded-lg shadow text-onSurface",
  },
  item: {
    base: "cursor-pointer focus:outline-none rounded-md px-2 py-2 body-medium text-onSurface hover:bg-hover",
    focus: "bg-hover",
  },
};

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
  buttonClassName,
  contentClassName,
  matchTriggerWidth = true,
  icon,
  buttonVariant = "dropdown",
  buttonSize = "dropdown",
  showRadio = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === (value ?? "")),
    [options, value],
  );

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === (value ?? "")),
    [options, value],
  );

  const displayLabel = selectedOption?.label ?? placeholder;

  // Calculate dropdown position
  const { position, contentWidth, contentMaxHeight, alignment, openUpwards } =
    useDropdownPosition(
      isOpen,
      dropdownRef,
      contentRef,
      undefined,
      matchTriggerWidth,
      "left"
    );

  // Adjust position relative to parent div for absolute positioning
  const parentRect = dropdownRef.current?.getBoundingClientRect();
  const adjustedTop = parentRect ? position.top - parentRect.top : position.top;
  const adjustedLeft = parentRect ? position.left - parentRect.left : position.left;

  // Auto-focus selected option when dropdown opens
  useEffect(() => {
    if (isOpen && options.length > 0) {
      const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;
      setFocusedIndex(initialIndex);
      // Small delay to ensure refs are populated
      setTimeout(() => {
        itemRefs.current[initialIndex]?.focus();
        itemRefs.current[initialIndex]?.scrollIntoView({ block: "nearest" });
      }, 0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isOpen, selectedIndex, options.length]);

  // Update focus when focusedIndex changes
  useEffect(() => {
    if (isOpen && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, isOpen]);

  // Handle outside clicks and escape key
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const isOutsideDropdown =
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node);
      const isOutsideContent =
        contentRef.current &&
        !contentRef.current.contains(event.target as Node);

      if (isOutsideDropdown && isOutsideContent) {
        setIsClosing(true);
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsClosing(true);
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      const itemsCount = options.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = (focusedIndex + 1) % itemsCount;
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = (focusedIndex - 1 + itemsCount) % itemsCount;
        setFocusedIndex(prevIndex);
        itemRefs.current[prevIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusedIndex(0);
        itemRefs.current[0]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "End") {
        e.preventDefault();
        const lastIndex = itemsCount - 1;
        setFocusedIndex(lastIndex);
        itemRefs.current[lastIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusedIndex >= 0) {
          const option = options[focusedIndex];
          onChange(option.value);
          setIsOpen(false);
        }
      }
    },
    [isOpen, focusedIndex, options, onChange]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      if (!isOpen) {
        setIsClosing(false);
      }
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleItemHover = (index: number) => {
    setFocusedIndex(index);
  };

  const setItemRef = (index: number) => (el: HTMLLIElement | null) => {
    itemRefs.current[index] = el;
  };

  const combinedStyle = {
    ...(matchTriggerWidth &&
      contentWidth > 0 && {
        width: `${String(contentWidth)}px`,
        minWidth: `${String(contentWidth)}px`,
      }),
    position: "absolute" as const,
    top: `${String(adjustedTop)}px`,
    left: `${String(adjustedLeft)}px`,
    maxHeight: `${String(contentMaxHeight)}px`,
    transformOrigin: getTransformOrigin(alignment, openUpwards),
    zIndex: 9999,
  };

  const originClass = getOriginClass(alignment, openUpwards);

  const content = (
    <>
      {/* Transparent overlay to block interactions outside dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          style={{ background: "transparent" }}
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Dropdown content */}
      <div
        ref={contentRef}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        role="menu"
        aria-orientation="vertical"
        className={cn(
          DROPDOWN_STYLES.content.base,
          { "w-[180px]": !matchTriggerWidth },
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 pointer-events-none scale-95",
          isOpen && !isClosing ? "transition-all duration-200 ease-out" : "",
          originClass,
          contentClassName
        )}
        style={combinedStyle}
      >
        <ul className="py-1 px-1">
          {options.map((option, index) => {
            const isFocused = focusedIndex === index;
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                ref={setItemRef(index)}
                tabIndex={-1}
                className={cn(DROPDOWN_STYLES.item.base, {
                  [DROPDOWN_STYLES.item.focus]: isFocused,
                })}
                onClick={() => {
                  handleOptionClick(option.value);
                }}
                onMouseEnter={() => {
                  handleItemHover(index);
                }}
              >
                {showRadio ? (
                  <div className="flex items-center ">
                    <span className="flex-1">{option.label}</span>
                    {isSelected && <PointFilled className="w-4 h-4" />}
                  </div>
                ) : (
                  option.label
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={cn("w-full justify-between", buttonClassName)}
        disabled={disabled}
        onClick={handleToggle}
      >
        <span className="truncate text-left flex-1">{displayLabel}</span>
        {icon ?? <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />}
      </Button>
      {content}
    </div>
  );
};

export type { SelectDropdownOption };
export default SelectDropdown;
