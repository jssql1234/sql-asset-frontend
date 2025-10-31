import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SetStateAction } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CustomColumnDef } from '@/components/ui/utils/dataTable';

export type DataTableColumn<TData, TValue> =
  | ColumnDef<TData, TValue>
  | CustomColumnDef<TData, TValue>;

interface UseTableColumnsOptions<TData, TValue> {
  columns: DataTableColumn<TData, TValue>[];
  lockedColumnIds?: string[];
  initialVisibleColumnIds?: string[];
  onVisibleColumnsChange?: (columns: DataTableColumn<TData, TValue>[]) => void;
}

interface UseTableColumnsResult<TData, TValue> {
  toggleableColumns: DataTableColumn<TData, TValue>[];
  visibleColumns: DataTableColumn<TData, TValue>[];
  setVisibleColumns: (updater: SetStateAction<DataTableColumn<TData, TValue>[]>) => void;
  displayedColumns: DataTableColumn<TData, TValue>[];
  handleColumnOrderChange: (orderedIds: string[]) => void;
}

function getColumnKey<TData, TValue>(
  column: DataTableColumn<TData, TValue>,
  fallbackIndex: number
): string {
  const potentialId = (column as { id?: unknown }).id;
  if (typeof potentialId === 'string' && potentialId.length > 0) {
    return potentialId;
  }

  const potentialAccessor = (column as { accessorKey?: unknown }).accessorKey;
  if (typeof potentialAccessor === 'string' || typeof potentialAccessor === 'number') {
    return String(potentialAccessor);
  }

  return `col-${fallbackIndex.toString()}`;
}

function areColumnsEqual<TData, TValue>(
  a: DataTableColumn<TData, TValue>[],
  b: DataTableColumn<TData, TValue>[]
): boolean {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  return a.every((column, index) => {
    return getColumnKey(column, index) === getColumnKey(b[index], index);
  });
}

const DEFAULT_LOCKED_COLUMN_IDS = ['select'];
const DEFAULT_LOCKED_IDS_KEY = '__default_locked_columns__';

export function useTableColumns<TData, TValue>(
  options: UseTableColumnsOptions<TData, TValue>
): UseTableColumnsResult<TData, TValue> {
  const {
    columns,
    lockedColumnIds,
    initialVisibleColumnIds,
    onVisibleColumnsChange,
  } = options;

  const lockedIdsKey = lockedColumnIds?.length
    ? lockedColumnIds.join('|')
    : DEFAULT_LOCKED_IDS_KEY;

  const normalizedLockedIds = useMemo(() => {
    if (lockedIdsKey === DEFAULT_LOCKED_IDS_KEY) {
      return [...DEFAULT_LOCKED_COLUMN_IDS];
    }
    return lockedIdsKey.split('|').map((id) => id);
  }, [lockedIdsKey]);

  const lockedColumns = useMemo(() => {
    return columns.filter((column, index) => {
      const key = getColumnKey(column, index);
      return normalizedLockedIds.includes(key);
    });
  }, [columns, normalizedLockedIds]);

  const toggleableColumns = useMemo(() => {
    return columns.filter((column, index) => {
      const key = getColumnKey(column, index);
      return !normalizedLockedIds.includes(key);
    });
  }, [columns, normalizedLockedIds]);

  const [visibleColumns, setVisibleColumnsState] = useState(() => {
    if (initialVisibleColumnIds?.length) {
      const keyedColumns = new Map(
        toggleableColumns.map((column, index) => [getColumnKey(column, index), column])
      );
      const initial = initialVisibleColumnIds
        .map(id => keyedColumns.get(id))
        .filter((column): column is DataTableColumn<TData, TValue> => Boolean(column));

      if (initial.length) {
        return initial;
      }
    }

    return toggleableColumns;
  });

  const setVisibleColumns = useCallback(
    (updater: SetStateAction<DataTableColumn<TData, TValue>[]>) => {
      setVisibleColumnsState(previous => {
        const next =
          typeof updater === 'function'
            ? (updater as (prev: DataTableColumn<TData, TValue>[]) => DataTableColumn<TData, TValue>[])(
                previous
              )
            : updater;

        if (areColumnsEqual(next, previous)) {
          return previous;
        }

        return next;
      });
    },
    []
  );

  useEffect(() => {
    setVisibleColumns(previous => {
      const columnMap = new Map(
        toggleableColumns.map((column, index) => [getColumnKey(column, index), column])
      );

      const next: DataTableColumn<TData, TValue>[] = [];
      const seenKeys = new Set<string>();

      previous.forEach((column, index) => {
        const key = getColumnKey(column, index);
        const current = columnMap.get(key);

        if (current && !seenKeys.has(key)) {
          next.push(current);
          seenKeys.add(key);
        }
      });

      toggleableColumns.forEach((column, index) => {
        const key = getColumnKey(column, index);
        if (!seenKeys.has(key)) {
          next.push(column);
          seenKeys.add(key);
        }
      });

      return areColumnsEqual(next, previous) ? previous : next;
    });
  }, [setVisibleColumns, toggleableColumns]);

  useEffect(() => {
    if (onVisibleColumnsChange) {
      onVisibleColumnsChange(visibleColumns);
    }
  }, [onVisibleColumnsChange, visibleColumns]);

  const displayedColumns = useMemo(() => {
    return [...lockedColumns, ...visibleColumns];
  }, [lockedColumns, visibleColumns]);

  const handleColumnOrderChange = useCallback(
    (orderedIds: string[]) => {
      if (!orderedIds.length) {
        return;
      }

      const lockedIdSet = new Set(normalizedLockedIds);

      setVisibleColumns(previous => {
        const columnMap = new Map(
          previous.map((column, index) => [getColumnKey(column, index), column])
        );

        const next: DataTableColumn<TData, TValue>[] = orderedIds
          .filter(id => !lockedIdSet.has(id))
          .map(id => columnMap.get(id))
          .filter((column): column is DataTableColumn<TData, TValue> => Boolean(column));

        if (!next.length) {
          return previous;
        }

        if (next.length < previous.length) {
          previous.forEach(column => {
            const key = getColumnKey(column, 0);
            if (!next.some(existing => getColumnKey(existing, 0) === key)) {
              next.push(column);
            }
          });
        }

        return areColumnsEqual(next, previous) ? previous : next;
      });
    },
    [normalizedLockedIds, setVisibleColumns]
  );

  return {
    toggleableColumns,
    visibleColumns,
    setVisibleColumns,
    displayedColumns,
    handleColumnOrderChange,
  };
}
