import type { MeterGroup, Meter } from "@/types/meter";
import { Badge, Button } from "@/components/ui/components";
import { Edit, Trash, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/components/Table";
import AssignAssetsModal from "./AssignAssetsModal";
import EditMeterModal from "./EditMeterModal";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

type MeterGroupDetailsProps = {
  group: MeterGroup;
  onEditMeter: (meter: Meter) => void;
  onDeleteMeter: (meterId: string) => void;
  availableAssets?: any[];
  onAssignAssets?: (assetIds: string[]) => void;
};

// Helper functions for meter condition labels
const getConditionTargetLabel = (value: string): string => {
  const options = {
    absolute: "New Reading",
    changed: "Relative Reading",
    cumulative: "Cumulative Reading",
  };
  return options[value as keyof typeof options] || value;
};

const getOperatorLabel = (value: string): string => {
  const options = {
    "=": "Equal to(=)",
    "<": "Less than (<)",
    ">": "Greater than (>)",
    "<=": "Less than or equal to (≤)",
    ">=": "Greater than or equal to (≥)",
    "!=": "Not equal to (≠)",
  };
  return options[value as keyof typeof options] || value;
};

const getTriggerActionLabel = (value: string): string => {
  const options = {
    none: "No Action",
    notification: "Send Alert",
    work_order: "Create Work Order",
    work_request: "Create Work Request",
  };
  return options[value as keyof typeof options] || value;
};

const getTriggerModeLabel = (value: string): string => {
  const options = {
    once: "Once",
    every_time: "Every time",
  };
  return options[value as keyof typeof options] || value;
};

export const MeterGroupDetails = ({
  group,
  onEditMeter,
  onDeleteMeter,
  availableAssets = [],
  onAssignAssets,
}: MeterGroupDetailsProps) => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [meterToEdit, setMeterToEdit] = useState<Meter | null>(null);
  const [meterToDelete, setMeterToDelete] = useState<Meter | null>(null);

  const handleAssignAssets = (assetIds: string[]) => {
    onAssignAssets?.(assetIds);
  };

  const handleEditClick = (meter: Meter) => {
    setMeterToEdit(meter);
    setIsEditModalOpen(true);
  };

  const handleEditSave = (updatedMeter: Meter) => {
    // Call the parent's onEditMeter handler with the updated meter
    onEditMeter(updatedMeter);
    setIsEditModalOpen(false);
    setMeterToEdit(null);
  };

  const handleDeleteClick = (meter: Meter) => {
    setMeterToDelete(meter);
  };

  const handleDeleteConfirm = () => {
    if (meterToDelete) {
      // Call the parent's onDeleteMeter handler with the meter ID
      onDeleteMeter(meterToDelete.id);
      setMeterToDelete(null);
    }
  };

  if (group.meters.length === 0) {
    return (
      <div className="px-4 py-6 text-sm text-onSurfaceVariant italic text-center">
        No meters in this group
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Assigned Assets Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="title-small uppercase font-semibold tracking-wide">
            Assigned Assets
          </h4>
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Assets
          </Button>
        </div>
        {group.assignedAssets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {group.assignedAssets.map((asset) => (
              <Badge
                key={asset.id}
                text={`${asset.name} (${asset.id})`}
                variant="grey"
                className="h-8 px-3 py-1 text-sm"
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-onSurfaceVariant italic px-1">
            No assets assigned to this group
          </div>
        )}
      </div>

      {/* Meters Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="title-small uppercase font-semibold tracking-wide">
            Meters
          </h4>
        </div>

        <div className="space-y-4">
          {group.meters.map((meter) => {
            const conditions = meter.conditions || [];

            return (
              <div
                key={meter.id}
                className="bg-surface border border-transparent rounded-lg overflow-hidden"
              >
                {/* Meter Header */}
                <div className="bg-primaryContainer px-4 py-2 flex items-center justify-between">
                  <div>
                    <span className="label- font-bold">{meter.uom}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(meter)}
                      className="p-1.5 hover:bg-surfaceContainerHighest rounded transition-colors"
                      title="Edit Meter"
                    >
                      <Edit className="h-4 w-4 text-onPrimaryContainer" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(meter)}
                      className="p-1.5 hover:bg-errorContainer rounded transition-colors"
                      title="Delete Meter"
                    >
                      <Trash className="h-4 w-4 text-error" />
                    </button>
                  </div>
                </div>

                {/* Conditions Table */}
                {conditions.length === 0 ? (
                  <div className="px-4 py-6 text-center text-onSurfaceVariant italic body-small">
                    No conditions set
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="font-semibold border-transparent bg-surfaceContainerLowest hover:bg-surfaceContainerLowest">
                        <TableHead className="w-[15%]">
                          Target Reading
                        </TableHead>
                        <TableHead className="w-[18%]">Operator</TableHead>
                        <TableHead className="w-[15%]">Value</TableHead>
                        <TableHead className="w-[25%]">
                          Trigger Action
                        </TableHead>
                        <TableHead className="w-[15%]">Mode</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conditions.map((condition, index) => (
                        <TableRow
                          key={condition.id}
                          className={cn(
                            "border-transparent hover:bg-hover",
                            index % 2 === 0
                              ? "bg-surfaceContainerLow"
                              : "bg-surfaceContainer"
                          )}
                        >
                          <TableCell>
                            {getConditionTargetLabel(condition.conditionTarget)}
                          </TableCell>
                          <TableCell>
                            {getOperatorLabel(condition.operator)}
                          </TableCell>
                          <TableCell>
                            {/* <Badge
                              text={condition.value}
                              variant="blue"
                              className="h-7 px-3"
                            /> */}
                            {condition.value}
                          </TableCell>
                          <TableCell>
                            {/* <span className="text-primary"> */}
                            {getTriggerActionLabel(condition.triggerAction)}
                            {/* </span> */}
                          </TableCell>
                          <TableCell>
                            <Badge
                              text={getTriggerModeLabel(condition.triggerMode)}
                              variant="grey"
                              className="h-6 px-2"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assign Assets Modal */}
      <AssignAssetsModal
        open={isAssignModalOpen}
        onOpenChange={setIsAssignModalOpen}
        availableAssets={availableAssets}
        currentAssets={group.assignedAssets}
        onAssign={handleAssignAssets}
      />

      {/* Edit Meter Modal */}
      <EditMeterModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        meter={meterToEdit}
        onSave={handleEditSave}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!meterToDelete}
        onClose={() => setMeterToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Meter"
        description={
          meterToDelete
            ? `Are you sure you want to delete the meter "${meterToDelete.uom}"? This action cannot be undone.`
            : undefined
        }
        itemName={meterToDelete?.uom}
        confirmButtonText="Delete Meter"
      />
    </div>
  );
};

export default MeterGroupDetails;
