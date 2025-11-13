import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardSensor, PointerSensor, type DragEndEvent, type DragOverEvent, type DragStartEvent, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { ColumnDef } from '@tanstack/react-table';
import type { CustomColumnDef } from '@/components/ui/utils/dataTable';
import { DEFAULT_FIXED_END_IDS, DEFAULT_FIXED_START_IDS, arraysAreEqual, reconcileColumnOrder, resolveColumnId } from './columnOrderHelpers';

export interface UseDraggableColumnOrderOptions<TData, TValue> {
  columns: (ColumnDef<TData, TValue> | CustomColumnDef<TData, TValue>)[];
  fixedStartIds?: string[];
  fixedEndIds?: string[];
  onOrderChange?: (order: string[]) => void;
}

export interface UseDraggableColumnOrderResult {
  columnOrder: string[];
  sensors: ReturnType<typeof useSensors>;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  activeId: string | null;
  overId: string | null;
  setColumnOrder: (
    updater: string[] | ((previous: string[]) => string[])
  ) => void;
}

export function useDraggableColumnOrder<TData, TValue>(
  options: UseDraggableColumnOrderOptions<TData, TValue>
): UseDraggableColumnOrderResult {
  const { columns, fixedEndIds, fixedStartIds, onOrderChange } = options;

  const availableIds = useMemo(
    () => columns.map((column, index) => resolveColumnId(column, index)),
    [columns]
  );

  const startIds = useMemo(
    () => fixedStartIds ?? DEFAULT_FIXED_START_IDS,
    [fixedStartIds]
  );
  const endIds = useMemo(() => fixedEndIds ?? DEFAULT_FIXED_END_IDS, [fixedEndIds]);

  const [columnOrder, setColumnOrderState] = useState(() =>
    reconcileColumnOrder({
      previousOrder: availableIds,
      availableIds,
      fixedStartIds: startIds,
      fixedEndIds: endIds,
    })
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const setColumnOrder = useCallback(
    (updater: string[] | ((previous: string[]) => string[])) => {
      setColumnOrderState((previous) => {
        const nextBase =
          typeof updater === 'function'
            ? (updater as (prev: string[]) => string[])(previous)
            : updater;

        const next = reconcileColumnOrder({
          previousOrder: nextBase,
          availableIds,
          fixedStartIds: startIds,
          fixedEndIds: endIds,
        });

        return arraysAreEqual(previous, next) ? previous : next;
      });
    },
    [availableIds, endIds, startIds]
  );

  useEffect(() => {
    setColumnOrderState((previous) => {
      const next = reconcileColumnOrder({
        previousOrder: previous,
        availableIds,
        fixedStartIds: startIds,
        fixedEndIds: endIds,
      });
      return arraysAreEqual(previous, next) ? previous : next;
    });
  }, [availableIds, endIds, startIds]);

  useEffect(() => {
    if (onOrderChange) {
      onOrderChange(columnOrder);
    }
  }, [columnOrder, onOrderChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const startSet = useMemo(() => new Set(startIds), [startIds]);
  const endSet = useMemo(() => new Set(endIds), [endIds]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setOverId(null);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const over = event.over?.id;
    if (over && over !== event.active.id) {
      setOverId(over as string);
    } else {
      setOverId(null);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const activeColumnId = active.id as string;
      const overColumnId = over?.id as string | undefined;

      if (!overColumnId || activeColumnId === overColumnId) {
        setActiveId(null);
        setOverId(null);
        return;
      }

      if (startSet.has(activeColumnId) || startSet.has(overColumnId)) {
        setActiveId(null);
        setOverId(null);
        return;
      }

      if (endSet.has(activeColumnId) || endSet.has(overColumnId)) {
        setActiveId(null);
        setOverId(null);
        return;
      }

      setColumnOrder((previous) => {
        const fromIndex = previous.indexOf(activeColumnId);
        const toIndex = previous.indexOf(overColumnId);

        if (fromIndex === -1 || toIndex === -1) {
          return previous;
        }

        return arrayMove(previous, fromIndex, toIndex);
      });

      setActiveId(null);
      setOverId(null);
    },
    [endSet, setColumnOrder, startSet]
  );

  return {
    columnOrder,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    overId,
    setColumnOrder,
  };
}
