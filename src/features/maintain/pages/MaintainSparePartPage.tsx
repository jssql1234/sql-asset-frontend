import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import SelectDropdown from '@/components/SelectDropdown';
import type { SelectDropdownOption } from '@/components/SelectDropdown';
import type { ColumnDef } from '@tanstack/react-table';
import { ExportFile} from '@/assets/icons';
import { SparePartsFormModal } from '../components/SparePartsFormModal';
import { SparePartsTable } from '../components/SparePartsTable';
import { SparePartsSearchAndFilter } from '../components/SparePartsSearchAndFilter';
import { useSpareParts } from '../hooks/useSpareParts';
import type { SparePart } from '../types/spareParts';

const MaintainSparePartPage: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'>('pdf');
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

  const handleVisibleColumnsChange = useCallback((visible: ColumnDef<SparePart>[]) => {
    setVisibleColumnIds(visible.map(c => c.id ?? ''));
  }, []);

  useEffect(() => {
    setVisibleColumnIds(['partId', 'name', 'category', 'stockQty', 'unitPrice', 'supplier', 'location', 'lastUpdated', 'status']);
  }, []);

  const {
    spareParts,
    filteredSpareParts,
    selectedSpareParts,
    filters,
    updateFilters,
    isModalOpen,
    editingPart,
    formErrors,
    clearFormErrors,
    closeModal,
    toggleSparePartSelection,
    exportData,
    handleAddSparePart,
    handleEditSparePart,
    handleDeleteMultipleSpareParts,
    handleSaveSparePart,
  } = useSpareParts();

  const handleExport = () => {
    exportData(selectedFormat, visibleColumnIds);
  };

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
                onChange={(value) => { setSelectedFormat(value as 'csv' | 'xlsx' | 'json' | 'txt' | 'html' | 'xml' | 'pdf'); }}
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
                Export Data
              </button>
            </div>
          }
        />

        <SparePartsSearchAndFilter
          filters={filters}
          onFiltersChange={updateFilters}
        />

        <div className="flex-1 overflow-hidden">
          <SparePartsTable
            spareParts={filteredSpareParts}
            selectedParts={selectedSpareParts}
            onToggleSelection={toggleSparePartSelection}
            onAddPart={handleAddSparePart}
            onEditPart={handleEditSparePart}
            onDeleteMultipleParts={handleDeleteMultipleSpareParts}
            onVisibleColumnsChange={handleVisibleColumnsChange}
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
