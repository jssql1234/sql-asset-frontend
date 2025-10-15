import React, { useMemo } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/components";
import { ChevronDown } from "@/assets/icons";
import { cn } from "@/utils/utils";

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
}

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
}) => {
  const selectedOption = useMemo(
    () => options.find((option) => option.value === (value ?? "")),
    [options, value],
  );

  const displayLabel = selectedOption?.label ?? placeholder;

  const handleValueChange = (nextValue: string) => {
    if (disabled) return;
    onChange(nextValue);
  };

  return (
    <DropdownMenu className={className}>
      <DropdownMenuTrigger disabled={disabled}>
        <Button
          variant={buttonVariant}
          size={buttonSize}
          className={cn("w-full justify-between", buttonClassName)}
          disabled={disabled}
        >
          <span className="truncate text-left flex-1">{displayLabel}</span>
          {icon ?? <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={contentClassName}
        matchTriggerWidth={matchTriggerWidth}
      >
        <DropdownMenuRadioGroup
          value={selectedOption?.value ?? "__placeholder__"}
          onValueChange={handleValueChange}
        >
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export type { SelectDropdownOption };
export default SelectDropdown;
