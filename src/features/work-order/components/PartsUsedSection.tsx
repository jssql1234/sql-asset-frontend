import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { PartUsed } from "../types";
import { DataTableExtended } from '@/components/DataTableExtended/DataTableExtended';
import { AddPartDialog } from "./AddPartDialog";
import { Button } from "@/components/ui/components";
import { BinFilled, Edit, Plus } from "@/assets/icons";

interface PartsUsedSectionProps {
  partsUsed: PartUsed[];
  onPartsChange: (parts: PartUsed[]) => void;
  disabled?: boolean;
}

export const PartsUsedSection: React.FC<PartsUsedSectionProps> = ({
  partsUsed,
  onPartsChange,
  disabled = false,
}) => {
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [editingPart, setEditingPart] = useState<PartUsed | null>(null);

  const handleAddPart = (partData: Omit<PartUsed, "id" | "totalCost">) => {
    if (editingPart) {
      // Update existing part
      const updatedParts = partsUsed.map((part) =>
        part.id === editingPart.id
          ? {
              ...part,
              partName: partData.partName,
              quantity: partData.quantity,
              unitCost: partData.unitCost,
              totalCost: partData.quantity * partData.unitCost,
            }
          : part
      );
      onPartsChange(updatedParts);
      setEditingPart(null);
    } else {
      // Add new part
      const newPart: PartUsed = {
        id: `PART-${Date.now()}`,
        ...partData,
        totalCost: partData.quantity * partData.unitCost,
      };
      onPartsChange([...partsUsed, newPart]);
    }
  };

  const handleEditPart = (part: PartUsed) => {
    setEditingPart(part);
    setShowAddPartDialog(true);
  };

  const handleDeletePart = (partId: string) => {
    onPartsChange(partsUsed.filter((part) => part.id !== partId));
  };

  // Parts table columns
  const partsColumns: ColumnDef<PartUsed>[] = [
    {
      accessorKey: "partName",
      header: "Part Name",
      cell: ({ row }) => (
        <span className="text-onSurface">
          {row.original.partName}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableResizing: true,
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <span className="text-onSurface block">
          {row.original.quantity}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableResizing: true,
    },
    {
      accessorKey: "unitCost",
      header: "Unit Cost (RM)",
      cell: ({ row }) => (
        <span className="text-onSurface block">
          {row.original.unitCost.toFixed(2)}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableResizing: true,
    },
    {
      accessorKey: "totalCost",
      header: "Subtotal (RM)",
      cell: ({ row }) => (
        <span className="text-onSurface block font-semibold">
          {row.original.totalCost.toFixed(2)}
        </span>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableResizing: true,
    },
    ...(disabled ? [] : [{
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleEditPart(row.original)}
            className="p-1 hover:bg-surfaceContainerHigh rounded transition-colors"
            title="Edit part"
          >
            <Edit className="w-4 h-4 text-onSurfaceVariant" />
          </button>
          <button
            type="button"
            onClick={() => handleDeletePart(row.original.id)}
            className="p-1 hover:bg-errorContainer rounded transition-colors"
            title="Delete part"
          >
            <BinFilled className="w-4 h-4 text-error" />
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
      enableResizing: true,
    }] as ColumnDef<PartUsed>[]),
  ];

  return (
    <>
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="title-medium font-semibold text-onSurface">
            Parts Used
          </h3>
          {!disabled && (
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setEditingPart(null);
                setShowAddPartDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Part
            </Button>
          )}
        </div>

        {partsUsed.length > 0 ? (
          <>
            <DataTableExtended
              columns={partsColumns}
              data={partsUsed}
              showPagination={false}
              showCheckbox={false}
            />
            
            {/* Total Parts Cost */}
            <div className="mt-4 bg-surfaceContainerLowest p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="label-large text-onSurface">
                  Total Parts Cost:
                </span>
                <span className="text-xl font-semibold text-onSurface">
                  RM {partsUsed.reduce((sum, part) => sum + part.totalCost, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="border border-outlineVariant rounded-lg p-8 text-center">
            <p className="body-medium text-onSurfaceVariant">
              No parts added yet. Click "Add Part" to get started.
            </p>
          </div>
        )}
      </section>

      {/* Add Part Dialog */}
      <AddPartDialog
        isOpen={showAddPartDialog}
        onClose={() => {
          setShowAddPartDialog(false);
          setEditingPart(null);
        }}
        onAdd={handleAddPart}
        editPart={editingPart}
      />
    </>
  );
};

export default PartsUsedSection;
