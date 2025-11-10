import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import SelectDropdown from '@/components/SelectDropdown';
import type { SelectDropdownOption } from '@/components/SelectDropdown';
import type { ColumnDef } from '@tanstack/react-table';
import { ExportFile, Plus } from '@/assets/icons';
import { SparePartsFormModal } from '../components/SparePartsFormModal';
import { SparePartsTable } from '../components/SparePartsTable';
import Search from '@/components/Search';
import { useSpareParts } from '../hooks/useSpareParts';
import { Button } from '@/components/ui/components';
import type { SparePart } from '../types/spareParts';
import TableColumnVisibility from '@/components/ui/components/Table/TableColumnVisibility';
import { useTableColumns } from '@/components/DataTableExtended/hooks/useTableColumns';
import { Badge } from '@/components/ui/components/Badge';
import {
  calculateStockStatus,
  formatCurrency,
  formatDate,
} from '../utils/sparePartsUtils';

const columnDefs: ColumnDef<SparePart>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="rounded border-outlineVariant text-primary focus:ring-primary"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="rounded border-outlineVariant text-primary focus:ring-primary"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'partId',
    accessorKey: 'id',
    header: 'Part ID',
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium">
        {row.original.id}
      </div>
    )
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-onSurfaceVariant">
          {row.original.description}
        </div>
      </div>
    ),
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: 'Category',
  },
  {
    id: 'stockQty',
    accessorKey: 'stockQty',
    header: 'Stock Qty',
    cell: ({ row }) => {
      const stock = row.original.stockQty;
      const threshold = row.original.lowStockThreshold;
      const isLow = stock <= threshold;

      return (
        <div
          className={`text-sm font-semibold ${
            isLow ? 'text-warning' : 'text-onSurface'
          }`}
        >
          {stock}
        </div>
      );
    },
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: ({ row }) => formatCurrency(row.original.unitPrice)
  },
  {
    id: 'supplier',
    accessorKey: 'supplier',
    header: 'Supplier',
  },
  {
    id: 'location',
    accessorKey: 'location',
    header: 'Location',
  },
  {
    id: 'lastUpdated',
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
    cell: ({ row }) => formatDate(row.original.lastUpdated)
  },

  {
    id: 'status',
    header: 'Status',
    accessorFn: row =>
      calculateStockStatus(
        row.stockQty,
        row.lowStockThreshold,
        row.operationalStatus
      ),

    cell: ({ row }) => {
      const value = row.getValue('status');
      const status = (value as string) || 'Unknown';

      const variant =
        status === 'In Stock'
          ? 'green'
          : status === 'Low Stock'
          ? 'yellow'
          : status === 'Out of Stock'
          ? 'red'
          : 'grey';

      return (
        <Badge
          text={status.toUpperCase()}
          variant={variant}
          className="h-6 px-3 uppercase font-semibold tracking-wide"
        />
      );
    },
  },
];

const MaintainSparePartPage: React.FC = () => {
  const [selectedFormat, setSelectedFormat] =
    useState<'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'>('pdf');
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);

  const exportOptions: SelectDropdownOption[] = [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'html', label: 'HTML' },
    { value: 'txt', label: 'TXT' },
  ];

  const handleVisibleColumnsChange = useCallback(
    (visible: ColumnDef<SparePart>[]) => {
      setVisibleColumnIds(visible.map(c => c.id ?? ''));
    },
    []
  );

  useEffect(() => {
    setVisibleColumnIds([
      'partId',
      'name',
      'category',
      'stockQty',
      'unitPrice',
      'supplier',
      'location',
      'lastUpdated',
      'status',
    ]);
  }, []);

  const {
    spareParts,
    filteredSpareParts,
    filters,
    updateFilters,
    isModalOpen,
    editingPart,
    formErrors,
    clearFormErrors,
    closeModal,
    exportData,
    handleAddSparePart,
    handleEditSparePart,
    handleDeleteMultipleSpareParts,
    handleSaveSparePart,
  } = useSpareParts();

  const handleExport = () => {
    exportData(selectedFormat, visibleColumnIds);
  };

  const handleDeleteSingle = (id: string) => {
    handleDeleteMultipleSpareParts([id]);
  };

const {
  toggleableColumns,
  visibleColumns,
  setVisibleColumns,
} = useTableColumns<SparePart, unknown>({
  columns: columnDefs,
  lockedColumnIds: ['select'],
  onVisibleColumnsChange: handleVisibleColumnsChange,
});

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Spare Parts Management"
          subtitle="Manage spare parts inventory and information"
          customActions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleAddSparePart}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Part
              </Button>

              <SelectDropdown
                value={selectedFormat}
                onChange={value => setSelectedFormat(value as any)}
                options={exportOptions}
                placeholder="Select format"
                buttonVariant="outline"
                buttonSize="sm"
                className="min-w-[100px]"
              />

              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
                title={`Export as ${selectedFormat.toUpperCase()}`}
              >
                <ExportFile className="w-4 h-4" />
                Export
              </button>
            </div>
          }
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TableColumnVisibility
              columns={toggleableColumns}
              visibleColumns={visibleColumns}
              setVisibleColumns={setVisibleColumns}
            />
          </div>

          <div className="flex justify-end w-full">
            <Search
              searchValue={filters.search ?? ''}
              searchPlaceholder="Search spare parts..."
              onSearch={value => updateFilters({ ...filters, search: value })}
              live
              className="max-w-md"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <SparePartsTable
            spareParts={filteredSpareParts}
            columns={visibleColumns}  
            onEditPart={handleEditSparePart}
            onDeletePart={handleDeleteSingle}
          />
        </div>

        <SparePartsFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleSaveSparePart}
          editingPart={editingPart}
          existingParts={spareParts}
          validationErrors={formErrors}
          clearValidationErrors={clearFormErrors}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainSparePartPage;
