import { useState, useMemo, useCallback, useEffect, memo } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@ui/components";
import { Input } from "@ui/components/Input";
import { Check, Filter, FilterFilled } from "@/assets/icons";
import type { Column } from "@tanstack/react-table";
import { cn } from "@/utils/utils";
import type { DropdownAlignment } from "@ui/utils/dropdown";
import type { Meta } from "@ui/utils/dataTable";

function TableFilter({
  column,
  uniqueValues = [],
  filterAlignment = 'center',
  filterType = 'checkbox',
}: {
  column: Column<any, unknown>;
  uniqueValues: string[];
  filterAlignment?: DropdownAlignment;
  filterType?: 'checkbox' | 'search';
}) {
  const sortedUniqueValues = useMemo(() => {
    const values = [...uniqueValues];
    return values.every((val) => !isNaN(Number(val)))
      ? values.sort((a, b) => Number(a) - Number(b))
      : values.sort();
  }, [uniqueValues]);

  const labelMap = (column.columnDef.meta as Meta)?.filterOptions ?? {};

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");

  useEffect(() => {
    if (filterType === 'checkbox') {
      const currentFilter = column.getFilterValue() as string[] | undefined;
      setCheckedItems(currentFilter || []);
    } else {
      const currentFilter = column.getFilterValue() as string | undefined;
      setSearchValue(currentFilter || '');
    }
  }, [column, filterType]);

  const toggleItem = useCallback(
    (val: string) => {
      setCheckedItems((prev) => {
        const newValues = prev.includes(val)
          ? prev.filter((item) => item !== val)
          : [...prev, val];

        // Defer the filter value update to avoid setState during render
        requestAnimationFrame(() => {
          column.setFilterValue(newValues.length ? newValues : undefined);
        });

        return newValues;
      });
    },
    [column]
  );

  const handleAllToggle = useCallback(() => {
    setCheckedItems((prev) => {
      const allSelected = prev.length === sortedUniqueValues.length;
      const newValues = allSelected ? [] : sortedUniqueValues;

      requestAnimationFrame(() => {
        column.setFilterValue(
          newValues.length === 0 ||
            newValues.length === sortedUniqueValues.length
            ? undefined
            : newValues
        );
      });

      return newValues;
    });
  }, [column, sortedUniqueValues]);

  const isAllSelected = useMemo(
    () => checkedItems.length === sortedUniqueValues.length,
    [checkedItems.length, sortedUniqueValues.length]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      column.setFilterValue(value || undefined);
    },
    [column]
  );

  if (filterType === 'search') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div>
            {searchValue ? (
              <FilterFilled className="w-4 h-4 text-onSurfaceVariant cursor-pointer" />
            ) : (
              <Filter className="w-4 h-4 text-onSwitchOffContainer cursor-pointer" />
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-32 w-max max-w-[280px]" defaultAlignment={filterAlignment}>
          <Input
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8"
            
          />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div>
          {checkedItems.length > 0 ? (
            <FilterFilled className="w-4 h-4 text-onSurfaceVariant cursor-pointer" />
          ) : (
            <Filter className="w-4 h-4 text-onSwitchOffContainer cursor-pointer" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-32 w-max max-w-[280px]" defaultAlignment={filterAlignment}>
        <DropdownMenuCheckboxItem
          checked={isAllSelected}
          onClick={handleAllToggle}
          className="font-bold"
          custom
        >
          <FakeCheckbox checked={isAllSelected} />
          <span className="flex-1 pl-2">All</span>
        </DropdownMenuCheckboxItem>
        {sortedUniqueValues.map((val) => {
          const isChecked = checkedItems.includes(val);
          const label = labelMap[String(val)] ?? String(val);
          return (
            <DropdownMenuCheckboxItem
              key={val}
              checked={isChecked}
              onClick={() => toggleItem(val)}
              className="gap-2"
              custom
            >
              <FakeCheckbox checked={isChecked} />
              <span className="flex-1 truncate">{label}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FakeCheckbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={cn(
        "w-4 h-4 min-w-4 min-h-4 rounded-sm border border-onSwitchOffContainer flex items-center justify-center",
        checked && "bg-primary"
      )}
    >
      {checked && <Check className="w-3 h-3 text-onPrimary" strokeWidth={3} />}
    </div>
  );
}

// improve table performance
export const MemoizedTableFilter = memo(TableFilter, (prev, next) => {
  return (
    prev.column.getFilterValue() === next.column.getFilterValue() &&
    prev.column.id === next.column.id &&
    prev.filterType === next.filterType &&
    prev.uniqueValues.join(",") === next.uniqueValues.join(",")
  );
});
