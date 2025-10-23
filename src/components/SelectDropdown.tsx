import React, { useMemo, useState, useRef, useEffect, useCallback, useReducer } from "react";
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
  disabled?: boolean;
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
  const [, dispatchScroll] = useReducer((state) => state + 1, 0);
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
  const { position, contentWidth, contentMaxHeight, alignment } =
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
  const buttonHeight = dropdownRef.current?.firstElementChild?.getBoundingClientRect().height ?? 0;
  const adjustedLeft = parentRect ? position.left - parentRect.left : position.left;
  // Force dropdown to always open downwards
  const forcedAdjustedTop = buttonHeight + 8; // OFFSET_FROM_BUTTON

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

      // Scroll page if dropdown would cover footer
      setTimeout(() => {
        const contentRect = contentRef.current?.getBoundingClientRect();
        if (contentRect) {
          const footerHeight = 80;
          const footerTop = window.innerHeight - footerHeight;
          if (contentRect.bottom > footerTop) {
            const scrollAmount = contentRect.bottom - footerTop + 10; // padding
            window.scrollBy(0, scrollAmount);
          }
        }
      }, 10); // slight delay after render
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

  // Handle scroll to reposition dropdown
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => { dispatchScroll(); };
      window.addEventListener("scroll", handleScroll, true);
      return () => { window.removeEventListener("scroll", handleScroll, true); };
    }
  }, [isOpen, dispatchScroll]);

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
        let nextIndex = (focusedIndex + 1) % itemsCount;
        // Skip disabled options
        while (options[nextIndex]?.disabled && nextIndex !== focusedIndex) {
          nextIndex = (nextIndex + 1) % itemsCount;
        }
        setFocusedIndex(nextIndex);
        itemRefs.current[nextIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        let prevIndex = (focusedIndex - 1 + itemsCount) % itemsCount;
        // Skip disabled options
        while (options[prevIndex]?.disabled && prevIndex !== focusedIndex) {
          prevIndex = (prevIndex - 1 + itemsCount) % itemsCount;
        }
        setFocusedIndex(prevIndex);
        itemRefs.current[prevIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Home") {
        e.preventDefault();
        let firstEnabledIndex = 0;
        while (options[firstEnabledIndex]?.disabled && firstEnabledIndex < itemsCount - 1) {
          firstEnabledIndex++;
        }
        setFocusedIndex(firstEnabledIndex);
        itemRefs.current[firstEnabledIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "End") {
        e.preventDefault();
        let lastEnabledIndex = itemsCount - 1;
        while (options[lastEnabledIndex]?.disabled && lastEnabledIndex > 0) {
          lastEnabledIndex--;
        }
        setFocusedIndex(lastEnabledIndex);
        itemRefs.current[lastEnabledIndex]?.scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (!option.disabled) {
            onChange(option.value);
            setIsOpen(false);
          }
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
    const option = options.find(opt => opt.value === optionValue);
    if (option?.disabled) return;
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
    top: `${String(forcedAdjustedTop)}px`,
    left: `${String(adjustedLeft)}px`,
    maxHeight: `${String(contentMaxHeight)}px`,
    transformOrigin: getTransformOrigin(alignment, false), // Always downward
    zIndex: 9999,
  };

  const originClass = getOriginClass(alignment, false); // Always downward

  const content = (
    <>
      {/* Transparent overlay to block interactions outside dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          style={{ background: "transparent" }}
          onClick={() => {setIsOpen(false)}}
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
                className={cn(DROPDOWN_STYLES.item.base, 
                  { [DROPDOWN_STYLES.item.focus]: isFocused },
                  option.disabled && "opacity-50 cursor-not-allowed text-onSurfaceVariant"
                )}
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
