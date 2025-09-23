import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/components/Input";
import { Search, X } from "@/assets/icons";
import { cn } from "@/utils/utils";
import { Button } from "./ui/components";

interface SearchProps {
  value?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  live?: boolean; // new prop
}

export default function SearchBar({
  value = "",
  onSearch,
  placeholder,
  className,
  disabled = false,
  live = false, // default: button/enter search
}: SearchProps) {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleClear = () => {
    setInternalValue("");
    onSearch("");
  };

  const handleSearchClick = () => {
    onSearch(internalValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!live && e.key === "Enter") {
      handleSearchClick();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (live) {
      onSearch(newValue.trim());
    }
  };

  return (
    <div className="flex w-full min-w-40">
      {/* Input */}
      <div className="relative flex flex-1">
        <Input
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("search")}
          className={cn("pr-10 h-[36px]", !live && "rounded-l rounded-r-none", className)}
          disabled={disabled}
        />
        {internalValue ? (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80"
            aria-label="Clear"
          >
            <X className="h-4 w-4 text-surfaceVariant" />
          </button>
        ) : (
          live && <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-onSurfaceVariant" />
        )}
      </div>

      {/* Button */}
      {!live && (
        <Button
          variant="outline"
          onClick={handleSearchClick}
          disabled={disabled}
          className="flex items-center gap-1 p-2 rounded-l-none rounded-r"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
