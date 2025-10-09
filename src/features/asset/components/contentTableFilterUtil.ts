/* eslint-disable @typescript-eslint/no-explicit-any */
//The any types in FilterFn<any> and Row<any> are required by TanStack Table for maximum flexibility across different data structures. 
// These are not unsafe usages of any but rather necessary for the library's type system to work properly.
import type { FilterFn, Row } from "@tanstack/react-table";

// IMPORTANT: Extend the FilterFns interface for type safety
declare module "@tanstack/react-table" {
  interface FilterFns {
    multiSelect: FilterFn<any>;
    fuzzyArrayIncludes: FilterFn<any>;
    searchIncludes: FilterFn<any>;
  }
}

export const multiSelectFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: string[]
) => {
  const cellValue = row.getValue(columnId);

  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    return true;
  }

  const cellValueString = String(cellValue);
  const isMatch = filterValue.some((val) => val === cellValueString);

  return isMatch;
};



export const fuzzyArrayIncludesFilterFn: FilterFn<any> = (
  row,
  columnId,
  filterValue: string[]
) => {
  const cellValue = row.getValue<string[] | string>(columnId);

  const values = Array.isArray(cellValue)
    ? cellValue
    : typeof cellValue === "string"
    ? cellValue.split(",").map((s) => s.trim())
    : [];

  return filterValue.some((val) => values.includes(val));
};


export const searchIncludesFilterFn: FilterFn<any> = (
  row,
  columnId,
  filterValue: string
) => {
  const cellValue = row.getValue<string[] | string>(columnId);

  if (!filterValue) return true;

  const searchValue = filterValue.toLowerCase();
  
  if (Array.isArray(cellValue)) {
    return cellValue.some(val =>
      val.toLowerCase().includes(searchValue) 
    );
  }

  return cellValue.toLowerCase().includes(searchValue);
};

