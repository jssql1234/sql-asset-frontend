import React from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { TabHeader } from '@/components/TabHeader';
import { ExportFile} from '@/assets/icons';
import { SparePartsFormModal } from '../components/SparePartsFormModal';
import { SparePartsTable } from '../components/SparePartsTable';
import { SparePartsSearchAndFilter } from '../components/SparePartsSearchAndFilter';
import { useSpareParts } from '../hooks/useSpareParts';

const MaintainSparePartPage: React.FC = () => {
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

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain Spare Part" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Spare Parts Management"
          subtitle="Manage spare parts inventory and information"
          customActions={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
                title="Export Data"
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
