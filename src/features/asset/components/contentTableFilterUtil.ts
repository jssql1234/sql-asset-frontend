import type { FilterFn, Row } from "@tanstack/react-table";

// IMPORTANT: Extend the FilterFns interface for type safety
declare module "@tanstack/react-table" {
  interface FilterFns {
    multiSelect: FilterFn<any>;
    fuzzyArrayIncludes: FilterFn<any>;
    searchIncludes: FilterFn<any>;
  }
}

/**
 * Custom filter function for multi-select dropdowns.
 * A row will be included if its value for the given column
 * is present in the array of filter values.
 *
 * @param row The current row object.
 * @param columnId The ID of the column being filtered (type: string).
 * @param filterValue An array of values to filter by (e.g., ['value1', 'value2']).
 * @returns True if the row should be included, false otherwise.
 */
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
  const isMatch = filterValue.some((val) => String(val) === cellValueString);

  return isMatch;
};

/**
 * Custom filter function for filtering arrays or individual values.
 * For array cell values: returns true if any array element matches any filter value.
 * For non-array cell values: returns true if the cell value matches any filter value.
 *
 * @param row The current row object.
 * @param columnId The ID of the column being filtered (type: string).
 * @param filterValue An array of values to filter by (e.g., ['completed', 'pending']).
 * @returns True if the row should be included, false otherwise.
 */

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

/**
 * Custom filter function for searching text within cell values.
 * Returns true if the cell value includes the search string (case-insensitive).
 * Works with both string and array cell values.
 *
 * @param row The current row object.
 * @param columnId The ID of the column being filtered.
 * @param filterValue The search string to filter by.
 * @returns True if the row should be included, false otherwise.
 */
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
      String(val).toLowerCase().includes(searchValue)
    );
  }

  return String(cellValue).toLowerCase().includes(searchValue);
};

