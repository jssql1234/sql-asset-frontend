import React, { useState, useEffect } from 'react';
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
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Badge } from '@/components/ui/components/Badge';
import {
  calculateStockStatus,
  formatCurrency,
  formatDate,
} from '../utils/sparePartsUtils';

const columnDefs: ColumnDef<SparePart>[] = [
  {
    id: 'partId',
    accessorKey: 'id',
    header: 'Part ID',
    cell: ({ row }) => (
      <div className="font-normal">
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
  const [sparePartToDelete, setSparePartToDelete] = useState<SparePart | null>(null);

  const exportOptions: SelectDropdownOption[] = [
    { value: 'pdf', label: 'PDF' },
    { value: 'xlsx', label: 'XLSX' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'html', label: 'HTML' },
    { value: 'txt', label: 'TXT' },
  ];

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
    handleDeleteSparePart,
    handleSaveSparePart,
  } = useSpareParts();

  const handleExport = () => {
    exportData(selectedFormat, visibleColumnIds);
  };

  const handleDeleteClick = (id: string) => {
    const part = spareParts.find(p => p.id === id);
    if (part) setSparePartToDelete(part);
  };

  const handleConfirmDelete = () => {
    if (sparePartToDelete) {
      handleDeleteSparePart(sparePartToDelete.id);
      setSparePartToDelete(null);
    }
  };

  const handleCancelDelete = () => setSparePartToDelete(null);

  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<SparePart>[]>(columnDefs);

  return (
    <AppLayout>
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Spare Parts Management"
          subtitle="Manage spare parts inventory and information"
          customActions={
            <div className="flex items-center gap-2">

              <SelectDropdown
                value={selectedFormat}
                onChange={value => setSelectedFormat(value as any)}
                options={exportOptions}
                placeholder="Select format"
                buttonVariant="outline"
                buttonSize="button"
                className="min-w-[100px]"
              />

              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 px-2.5 py-1.5 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover transition"
                title={`Export as ${selectedFormat.toUpperCase()}`}
              >
                <ExportFile className="w-4 h-4" />
                Export
              </button>

              <Button
                type="button"
                onClick={handleAddSparePart}
                className="flex items-center gap-2 px-2.5 py-1.5 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover transition"
              >
                <Plus className="h-4 w-4" />
                Add Part
              </Button>
            </div>
          }
        />

        <div className="flex items-center justify-between gap-2">
            <div className="relative">
              <div className="relative top-2">
                <TableColumnVisibility
                  columns={columnDefs}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={setVisibleColumns}
                />
              </div>
            </div>

          <div className="flex justify-end w-full">
            <Search
              searchValue={filters.search ?? ''}
              searchPlaceholder="Search spare parts..."
              onSearch={value => updateFilters({ ...filters, search: value })}
              live
              className="w-80"
              inputClassName="h-10 w-full"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <SparePartsTable
            spareParts={filteredSpareParts}
            columns={visibleColumns}  
            onEditPart={handleEditSparePart}
            onDeletePart={handleDeleteClick}
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

        <DeleteConfirmationDialog
          isOpen={!!sparePartToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete spare part?"
          description="This will permanently remove the spare part. This action cannot be undone."
          confirmButtonText="Delete Spare Part"
          itemIds={sparePartToDelete ? [sparePartToDelete.id] : []}
          itemNames={sparePartToDelete ? [sparePartToDelete.name] : []}
          itemCount={sparePartToDelete ? 1 : 0}
        />
      </div>
    </AppLayout>
  );
};

export default MaintainSparePartPage;
