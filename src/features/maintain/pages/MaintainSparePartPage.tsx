import React, { useState } from 'react';
import { SidebarHeader } from '@/layout/sidebar/SidebarHeader';
import { TabHeader } from '@/components/TabHeader';
import { Plus, ExportFile, Settings } from '@/assets/icons';
import { SparePartsFormModal } from '../components/SparePartsFormModal';
import { SparePartsTable } from '../components/SparePartsTable';
import { SparePartsSearchAndFilter } from '../components/SparePartsSearchAndFilter';
import { useSpareParts } from '../hooks/useSpareParts';
import type { SparePart, SparePartFormData } from '../types/spareParts';
import { useToast } from '@/components/ui/components/Toast/useToast';

const MaintainSparePartPage: React.FC = () => {
  const {
    filteredSpareParts,
    selectedSpareParts,
    filters,
    updateFilters,
    addSparePart,
    updateSparePart,
    deleteSparePart,
    deleteMultipleSpareParts,
    toggleSparePartSelection,
    resetToSampleData,
    exportData,
  } = useSpareParts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const { addToast } = useToast();

  const handleAddSparePart = () => {
    setEditingPart(null);
    setIsModalOpen(true);
  };

  const handleEditSparePart = (part: SparePart) => {
    setEditingPart(part);
    setIsModalOpen(true);
  };

  const handleSaveSparePart = (formData: SparePartFormData) => {
    try {
      if (editingPart) {
        updateSparePart(formData);
        addToast({
          title: "Success",
          description: "Spare part updated successfully!",
          variant: "success",
        });
      } else {
        addSparePart(formData);
        addToast({
          title: "Success",
          description: "Spare part added successfully!",
          variant: "success",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while saving the spare part.",
        variant: "error",
      });
      throw error; // Re-throw so the modal can handle it too
    }
  };

  const handleDeleteSparePart = (id: string) => {
    if (confirm('Are you sure you want to delete this spare part?')) {
      try {
        deleteSparePart(id);
        addToast({
          title: "Success",
          description: "Spare part deleted successfully!",
          variant: "success",
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred while deleting the spare part.",
          variant: "error",
        });
      }
    }
  };

  const handleDeleteMultipleSpareParts = (ids: string[]) => {
    if (confirm(`Are you sure you want to delete ${String(ids.length)} selected spare parts?`)) {
      try {
        deleteMultipleSpareParts(ids);
        addToast({
          title: "Success",
          description: `${String(ids.length)} spare parts deleted successfully!`,
          variant: "success",
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred while deleting the spare parts.",
          variant: "error",
        });
      }
    }
  };

  const handleResetToSampleData = () => {
    if (confirm('Are you sure you want to reset to sample data? This will overwrite any existing data.')) {
      try {
        resetToSampleData();
        addToast({
          title: "Success",
          description: "Data reset to sample data successfully!",
          variant: "success",
        });
      } catch (error) {
        addToast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred while resetting the data.",
          variant: "error",
        });
      }
    }
  };

  const handleExportData = () => {
    try {
      exportData();
      addToast({
        title: "Success",
        description: "Data exported successfully!",
        variant: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while exporting the data.",
        variant: "error",
      });
    }
  };

  return (
    <SidebarHeader
      breadcrumbs={[
        { label: "Tools" },
        { label: "Maintain Spare Part" },
      ]}
    >
      <div className="flex h-full flex-col gap-4 overflow-hidden">
        <TabHeader
          title="Spare Parts Management"
          subtitle="Manage spare parts inventory and information"
          actions={[
            {
              label: "Add Spare Part",
              onAction: handleAddSparePart,
              icon: <Plus />,
              variant: "default",
            },
          ]}
          customActions={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
                title="Export Data"
              >
                <ExportFile className="w-4 h-4" />
                Export Data
              </button>
              <button
                type="button"
                onClick={handleResetToSampleData}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-outlineVariant rounded-md bg-surfaceContainerHighest text-onSurface hover:bg-hover"
                title="Reset to Sample"
              >
                <Settings className="w-4 h-4" />
                Reset to Sample
              </button>
            </div>
          }
        />

        <SparePartsSearchAndFilter
          filters={filters}
          onFiltersChange={updateFilters}
          spareParts={filteredSpareParts}
        />

        <div className="flex-1 overflow-hidden">
          <SparePartsTable
            spareParts={filteredSpareParts}
            selectedParts={selectedSpareParts}
            onToggleSelection={toggleSparePartSelection}
            onEditPart={handleEditSparePart}
            onDeletePart={handleDeleteSparePart}
            onDeleteMultipleParts={handleDeleteMultipleSpareParts}
          />
        </div>

        <SparePartsFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onSave={handleSaveSparePart}
          editingPart={editingPart}
          existingParts={filteredSpareParts}
        />
      </div>
    </SidebarHeader>
  );
};

export default MaintainSparePartPage;