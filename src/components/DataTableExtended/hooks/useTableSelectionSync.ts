import { useCallback, useMemo } from 'react';

interface UseTableSelectionSyncOptions<TData> {
  data: TData[];
  selectedIds: string[];
  getRowId: (row: TData) => string;
  onToggleSelection: (id: string) => void;
}

interface UseTableSelectionSyncResult<TData> {
  rowSelection: Record<string, boolean>;
  handleRowSelectionChange: (selectedRows: TData[]) => void;
  selectedCount: number;
  hasSelection: boolean;
  singleSelectedItem?: TData;
  clearSelection: () => void;
}

export function useTableSelectionSync<TData>(
  options: UseTableSelectionSyncOptions<TData>
): UseTableSelectionSyncResult<TData> {
  const { data, selectedIds, getRowId, onToggleSelection } = options;

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const rowSelection = useMemo(() => {
    if (!selectedIds.length) {
      return {};
    }

    return data.reduce<Record<string, boolean>>((acc, row, index) => {
      const id = getRowId(row);
      if (selectedIdSet.has(id)) {
        acc[index.toString()] = true;
      }
      return acc;
    }, {});
  }, [data, getRowId, selectedIdSet, selectedIds.length]);

  const handleRowSelectionChange = useCallback(
    (selectedRows: TData[]) => {
      const nextSelected = new Set(selectedRows.map(getRowId));

      nextSelected.forEach(id => {
        if (!selectedIdSet.has(id)) {
          onToggleSelection(id);
        }
      });

      selectedIds.forEach(id => {
        if (!nextSelected.has(id)) {
          onToggleSelection(id);
        }
      });
    },
    [getRowId, onToggleSelection, selectedIdSet, selectedIds]
  );

  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;

  const singleSelectedItem = useMemo(() => {
    if (selectedCount !== 1) {
      return undefined;
    }

    const targetId = selectedIds[0];
    return data.find(row => getRowId(row) === targetId);
  }, [data, getRowId, selectedCount, selectedIds]);

  const clearSelection = useCallback(() => {
    if (!selectedIds.length) {
      return;
    }

    selectedIds.forEach(onToggleSelection);
  }, [onToggleSelection, selectedIds]);

  return {
    rowSelection,
    handleRowSelectionChange,
    selectedCount,
    hasSelection,
    singleSelectedItem,
    clearSelection,
  };
}
