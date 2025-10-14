import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/components/Dialog";
import { Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import type { Meter, MeterCondition } from "../../../types/meter";

type MeterWithConditions = Meter;

interface EditMeterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meter: MeterWithConditions | null;
  onSave: (meter: MeterWithConditions) => void;
}

const CONDITION_TARGET_OPTIONS = [
  { value: "absolute", label: "New Reading" },
  { value: "changed", label: "Relative Reading" },
  { value: "cumulative", label: "Cumulative Reading" },
];

const OPERATOR_OPTIONS = [
  { value: "=", label: "Equal to(=)" },
  { value: "<", label: "Less than (<)" },
  { value: ">", label: "Greater than (>)" },
  { value: "<=", label: "Less than or equal to (≤)" },
  { value: ">=", label: "Greater than or equal to (≥)" },
  { value: "!=", label: "Not equal to (≠)" },
];

const TRIGGER_ACTION_OPTIONS = [
  { value: "none", label: "No Action" },
  { value: "notification", label: "Send Notification" },
  { value: "work_order", label: "Create Work Order & Send Notification" },
  { value: "work_request", label: "Create Work Request & Send Notification" },
];

const TRIGGER_MODE_OPTIONS = [
  { value: "once", label: "Once" },
  { value: "every_time", label: "Every Time" },
];

const EditMeterModal = ({
  open,
  onOpenChange,
  meter,
  onSave,
}: EditMeterModalProps) => {
  const [uom, setUom] = useState("");
  const [conditions, setConditions] = useState<MeterCondition[]>([]);

  useEffect(() => {
    if (meter) {
      setUom(meter.uom);
      setConditions(meter.conditions || []);
    } else {
      setUom("");
      setConditions([]);
    }
  }, [meter, open]);

  const handleAddCondition = () => {
    const newCondition: MeterCondition = {
      id: `condition-${Date.now()}`,
      conditionTarget: "absolute",
      operator: "=",
      value: "",
      triggerAction: "none",
      triggerMode: "once",
    };
    setConditions([...conditions, newCondition]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const handleConditionChange = (
    id: string,
    field: keyof MeterCondition,
    value: string | number
  ) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleSave = () => {
    if (!meter) return;

    const updatedMeter: MeterWithConditions = {
      ...meter,
      uom: uom,
      conditions,
    };

    onSave(updatedMeter);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!meter) return null;

  const isAddMode = meter?.id.startsWith('m-');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl overflow-auto" dialogClose={true}>
        <DialogHeader>
          <DialogTitle>{isAddMode ? 'Add New Meter' : 'Edit Meter'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* UOM Field */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-onSurface">
              Unit of Measurement (UOM){" "}
              <span className="text-error">*</span>
            </label>
            <Input
              type="text"
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              placeholder="Enter unit (e.g., mL, kg, ea)"
              className="max-w-xs"
            />
          </div>

          {/* Conditions Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-onSurface">
                Conditions
              </label>
              <span className="text-xs text-onSurfaceVariant">
                (Add multiple conditions to trigger on different values)
              </span>
            </div>

            {/* Conditions List */}
            <div className="flex flex-col gap-3">
              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className="flex items-center gap-3 rounded border border-outlineVariant bg-surfaceContainerLowest p-3"
                >
                  <span className="text-sm font-medium text-onSurfaceVariant">
                    Where
                  </span>

                  {/* Condition Target */}
                  <select
                    value={condition.conditionTarget}
                    onChange={(e) =>
                      handleConditionChange(
                        condition.id,
                        "conditionTarget",
                        e.target.value
                      )
                    }
                    className="rounded border border-outlineVariant bg-surface px-3 py-2 text-sm text-onSurface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CONDITION_TARGET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Operator */}
                  <select
                    value={condition.operator}
                    onChange={(e) =>
                      handleConditionChange(
                        condition.id,
                        "operator",
                        e.target.value
                      )
                    }
                    className="rounded border border-outlineVariant bg-surface px-3 py-2 text-sm text-onSurface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {OPERATOR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Value */}
                  <Input
                    type="text"
                    value={condition.value}
                    onChange={(e) =>
                      handleConditionChange(
                        condition.id,
                        "value",
                        e.target.value
                      )
                    }
                    placeholder="Value"
                    className="w-32"
                  />

                  <span className="text-sm font-medium text-onSurfaceVariant">
                    then
                  </span>

                  {/* Trigger Action */}
                  <select
                    value={condition.triggerAction}
                    onChange={(e) =>
                      handleConditionChange(
                        condition.id,
                        "triggerAction",
                        e.target.value
                      )
                    }
                    className="flex-1 rounded border border-outlineVariant bg-surface px-3 py-2 text-sm text-onSurface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {TRIGGER_ACTION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <span className="text-sm font-medium text-onSurfaceVariant">
                    in
                  </span>

                  {/* Trigger Mode */}
                  <select
                    value={condition.triggerMode}
                    onChange={(e) =>
                      handleConditionChange(
                        condition.id,
                        "triggerMode",
                        e.target.value
                      )
                    }
                    className="rounded border border-outlineVariant bg-surface px-3 py-2 text-sm text-onSurface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {TRIGGER_MODE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveCondition(condition.id)}
                    className="px-3"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Condition Button */}
            <div>
              <Button
                variant="ghost"
                onClick={handleAddCondition}
                className="text-sm"
              >
                + Add Condition
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave} disabled={!uom.trim()}>
            {isAddMode ? 'Add Meter' : 'Save Meter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMeterModal;
