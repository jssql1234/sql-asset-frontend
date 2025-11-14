import type { ColumnDef } from '@tanstack/react-table';
import type { CustomColumnDef } from '@/components/ui/utils/dataTable';

export type DataTableColumn<TData, TValue> = ColumnDef<TData, TValue> | CustomColumnDef<TData, TValue>;

export const DEFAULT_FIXED_START_IDS = ['select'];
export const DEFAULT_FIXED_END_IDS = ['row-actions'];

export function resolveColumnId<TData, TValue>(column: DataTableColumn<TData, TValue>, index: number): string {
  if ('id' in column && column.id) {
    return column.id;
  }

  if ('accessorKey' in column && column.accessorKey) {
    return String(column.accessorKey);
  }

  return `col-${index.toString()}`;
}

function toOrderedUnique(ids: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  ids.forEach((id) => {
    if (!seen.has(id)) {
      unique.push(id);
      seen.add(id);
    }
  });

  return unique;
}

function sanitizeOrder({
  order,
  availableIds,
  fixedStartIds,
  fixedEndIds,
}: {
  order: string[];
  availableIds: string[];
  fixedStartIds: string[];
  fixedEndIds: string[];
}): string[] {
  const availableSet = new Set(availableIds);
  const fixedStartSet = new Set(fixedStartIds);
  const fixedEndSet = new Set(fixedEndIds);
  const middle: string[] = [];
  const seen = new Set<string>();
  const basePositions = new Map<string, number>();

  availableIds.forEach((id, index) => {
    basePositions.set(id, index);
  });

  order.forEach((id) => {
    if (!availableSet.has(id)) return;
    if (fixedStartSet.has(id) || fixedEndSet.has(id)) return;
    if (seen.has(id)) return;
    middle.push(id);
    seen.add(id);
  });

  availableIds.forEach((id) => {
    if (fixedStartSet.has(id) || fixedEndSet.has(id)) return;
    if (seen.has(id)) return;
    const targetPosition = basePositions.get(id) ?? Number.POSITIVE_INFINITY;
    let insertIndex = 0;

    for (let i = 0; i < middle.length; i += 1) {
      const existingId = middle[i];
      const existingPosition = basePositions.get(existingId) ?? Number.POSITIVE_INFINITY;

      if (existingPosition <= targetPosition) {
        insertIndex = i + 1;
      }
    }

    middle.splice(insertIndex, 0, id);
    seen.add(id);
  });

  const start = fixedStartIds.filter((id) => availableSet.has(id));
  const end = fixedEndIds.filter((id) => availableSet.has(id));

  return [...start, ...middle, ...end];
}

export function reconcileColumnOrder({
  previousOrder,
  availableIds,
  fixedStartIds = DEFAULT_FIXED_START_IDS,
  fixedEndIds = DEFAULT_FIXED_END_IDS,
}: {
  previousOrder: string[];
  availableIds: string[];
  fixedStartIds?: string[];
  fixedEndIds?: string[];
}): string[] {
  const effectivePrevious = previousOrder.length ? previousOrder : availableIds;
  const sanitized = sanitizeOrder({
    order: toOrderedUnique(effectivePrevious),
    availableIds,
    fixedStartIds,
    fixedEndIds,
  });

  return sanitized;
}

export function arraysAreEqual(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}
