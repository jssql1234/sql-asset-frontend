import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import { SearchableDropdown } from "@/components/SearchableDropdown";
import type { PartUsed } from "../types";

interface AddPartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (part: Omit<PartUsed, "id" | "totalCost">) => void;
  editPart?: PartUsed | null;
}

// Mock parts inventory - In production, this would come from an API
const MOCK_PARTS_INVENTORY = [
  { id: "PART-001", name: "Oil Filter", unitCost: 25.50 },
  { id: "PART-002", name: "Air Filter", unitCost: 18.75 },
  { id: "PART-003", name: "Hydraulic Oil (5L)", unitCost: 85.00 },
  { id: "PART-004", name: "Engine Oil (4L)", unitCost: 120.00 },
  { id: "PART-005", name: "Spark Plug", unitCost: 12.50 },
  { id: "PART-006", name: "Brake Pad Set", unitCost: 150.00 },
  { id: "PART-007", name: "Coolant (5L)", unitCost: 45.00 },
  { id: "PART-008", name: "Fan Belt", unitCost: 35.00 },
  { id: "PART-009", name: "Fuel Filter", unitCost: 28.00 },
  { id: "PART-010", name: "Grease (1kg)", unitCost: 22.00 },
];

export const AddPartDialog: React.FC<AddPartDialogProps> = ({
  isOpen,
  onClose,
  onAdd,
  editPart,
}) => {
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [partName, setPartName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);

  const [errors, setErrors] = useState<{
    partName?: boolean;
    quantity?: boolean;
    unitCost?: boolean;
  }>({});

  // Populate form when editPart changes
  useEffect(() => {
    if (editPart) {
      setPartName(editPart.partName);
      setQuantity(editPart.quantity);
      setUnitCost(editPart.unitCost);
      // Try to find matching part in inventory
      const matchingPart = MOCK_PARTS_INVENTORY.find(p => p.name === editPart.partName);
      if (matchingPart) {
        setSelectedPartId(matchingPart.id);
      }
    } else {
      // Reset form
      setSelectedPartId("");
      setPartName("");
      setQuantity(1);
      setUnitCost(0);
    }
    setErrors({});
  }, [editPart, isOpen]);

  const handlePartSelection = (partId: string) => {
    setSelectedPartId(partId);
    const part = MOCK_PARTS_INVENTORY.find((p) => p.id === partId);
    if (part) {
      setPartName(part.name);
      setUnitCost(part.unitCost);
      if (errors.partName) {
        setErrors((prev) => ({ ...prev, partName: false }));
      }
      if (errors.unitCost) {
        setErrors((prev) => ({ ...prev, unitCost: false }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    const newErrors: typeof errors = {};

    // Validation
    if (!partName.trim()) {
      newErrors.partName = true;
    }

    if (quantity <= 0) {
      newErrors.quantity = true;
    }

    if (unitCost <= 0) {
      newErrors.unitCost = true;
    }

    // If there are errors, update state and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the part
    onAdd({
      partName: partName.trim(),
      quantity,
      unitCost,
    });

    handleClose();
  };

  const handleClose = () => {
    setSelectedPartId("");
    setPartName("");
    setQuantity(1);
    setUnitCost(0);
    setErrors({});
    onClose();
  };

  const totalCost = quantity * unitCost;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[600px] max-w-[90vw]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="headline-small font-semibold text-onSurface">
            {editPart ? "Edit Part" : "Add Part"}
          </h2>
          <p className="body-medium text-onSurfaceVariant mt-1">
            {editPart 
              ? "Update part details for this work order" 
              : "Select a part from inventory or enter manually"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 space-y-4">
            {/* Part Selection from Inventory */}
            <div>
              <label className="label-large block mb-2 text-onSurface">
                Select from Inventory
              </label>
              <SearchableDropdown
                items={MOCK_PARTS_INVENTORY.map((part) => ({
                  id: part.id,
                  label: part.name,
                  sublabel: `RM ${part.unitCost.toFixed(2)}`,
                }))}
                selectedId={selectedPartId}
                onSelect={handlePartSelection}
                placeholder="Search parts..."
                emptyMessage="No parts found"
              />
              <p className="body-small text-onSurfaceVariant mt-1">
                Or enter part details manually below
              </p>
            </div>

            {/* Part Name */}
            <div>
              <label className="label-large block mb-2 text-onSurface">
                Part Name <span className="text-error">*</span>
              </label>
              <Input
                value={partName}
                onChange={(e) => {
                  setPartName(e.target.value);
                  if (errors.partName && e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, partName: false }));
                  }
                }}
                placeholder="Enter part name"
                className={`w-full ${errors.partName ? "border-error focus:border-error" : ""}`}
              />
              {errors.partName && (
                <p className="text-error body-small mt-1">Part name is required</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="label-large block mb-2 text-onSurface">
                  Quantity <span className="text-error">*</span>
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setQuantity(value);
                    if (errors.quantity && value > 0) {
                      setErrors((prev) => ({ ...prev, quantity: false }));
                    }
                  }}
                  placeholder="0"
                  className={`w-full ${errors.quantity ? "border-error focus:border-error" : ""}`}
                />
                {errors.quantity && (
                  <p className="text-error body-small mt-1">Quantity must be greater than 0</p>
                )}
              </div>

              {/* Unit Cost */}
              <div>
                <label className="label-large block mb-2 text-onSurface">
                  Unit Cost (RM) <span className="text-error">*</span>
                </label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={unitCost}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setUnitCost(value);
                    if (errors.unitCost && value > 0) {
                      setErrors((prev) => ({ ...prev, unitCost: false }));
                    }
                  }}
                  placeholder="0.00"
                  className={`w-full ${errors.unitCost ? "border-error focus:border-error" : ""}`}
                />
                {errors.unitCost && (
                  <p className="text-error body-small mt-1">Unit cost must be greater than 0</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded text-primary hover:bg-primary/10 transition-colors label-large"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary text-onPrimary hover:bg-primary/90 transition-colors label-large"
            >
              {editPart ? "Update Part" : "Add Part"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPartDialog;
