import type { MeterGroup, Meter } from "@/types/meter";
import { Badge } from "@/components/ui/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/components/Table";
import { Edit, Trash } from "lucide-react";

type MeterGroupDetailsProps = {
  group: MeterGroup;
  onEditMeter: (meter: Meter) => void;
  onDeleteMeter: (meterId: string) => void;
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
    notification: "Send Notification",
    work_order: "Create Work Order & Send Notification",
    work_request: "Create Work Request & Send Notification",
  };
  return options[value as keyof typeof options] || value;
};

const getTriggerModeLabel = (value: string): string => {
  const options = {
    once: "Once",
    every_time: "Every Time",
  };
  return options[value as keyof typeof options] || value;
};

export const MeterGroupDetails = ({
  group,
  onEditMeter,
  onDeleteMeter,
}: MeterGroupDetailsProps) => {
  if (group.meters.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-onSurfaceVariant italic">
        No meters in this group
      </div>
    );
  }

  return (
    <div className="bg-primaryontainer p-15 pt-4">
      <h4 className="mb-3 text-sm font-bold text-onSurface">
        Meters in {group.name}
      </h4>
      <div className="overflow-hidden rounded border border-outlineVariant bg-surface">
        <Table>
          <TableHeader className="bg-secondaryContainer">
            <TableRow>
              <TableHead className="w-[10%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-onSurface">
                UOM
              </TableHead>
              <TableHead className="w-[15%] px-4 py-3 text-xs font-semibold text-onSurface">
                Target Reading
              </TableHead>
              <TableHead className="w-[12%] px-4 py-3 text-xs font-semibold text-onSurface">
                Operator
              </TableHead>
              <TableHead className="w-[14%] px-4 py-3 text-xs font-semibold text-onSurface">
                Value
              </TableHead>
              <TableHead className="w-[24%] px-4 py-3 text-xs font-semibold text-onSurface">
                Trigger Action
              </TableHead>
              <TableHead className="w-[15%] px-4 py-3 text-xs font-semibold text-onSurface">
                Trigger Mode
              </TableHead>
              <TableHead className="w-[5%] px-4 py-3 text-xs font-semibold text-onSurface" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {group.meters.map((meter) => {
              const conditions = meter.conditions || [];

              if (conditions.length === 0) {
                return (
                  <TableRow
                    key={meter.id}
                    className="text-sm bg-surfaceContainerLow "
                  >
                    <TableCell className="bg-surfaceContainerLow px-4 py-3 font-medium text-onSurface">
                      {meter.uom}
                    </TableCell>
                    <TableCell
                      colSpan={5}
                      className="px-4 py-4 text-center text-onSurfaceVariant italic"
                    >
                      No conditions set
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditMeter(meter)}
                          className="p-1 hover:bg-surfaceContainerHighest rounded transition-colors"
                          title="Edit Meter"
                        >
                          <Edit className="h-4 w-4 text-onSurfaceVariant" />
                        </button>
                        <button
                          onClick={() => onDeleteMeter(meter.id)}
                          className="p-1 hover:bg-surfaceContainerHighest rounded transition-colors"
                          title="Delete Meter"
                        >
                          <Trash className="h-4 w-4 text-error" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }

              return conditions.map((condition, index) => (
                <TableRow
                  key={`${meter.id}-${condition.id}`}
                  className={`text-sm bg-surfaceContainerLow ${
                    index === conditions.length - 1 ? "" : "border-b-0"
                  }`}
                >
                  {index === 0 && (
                    <TableCell
                      rowSpan={conditions.length}
                      className="bg-surfaceContainerLow px-4 py-3 font-medium text-onSurface"
                    >
                      {meter.uom}
                    </TableCell>
                  )}
                  <TableCell className="px-4 py-3 text-onSurface">
                    {getConditionTargetLabel(condition.conditionTarget)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-onSurface">
                    {getOperatorLabel(condition.operator)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-onSurface">
                    {condition.value}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-onSurface">
                    {getTriggerActionLabel(condition.triggerAction)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-onSurface">
                    {getTriggerModeLabel(condition.triggerMode)}
                  </TableCell>
                  {index === 0 && (
                    <TableCell
                      rowSpan={conditions.length}
                      className="px-4 py-3"
                    >
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditMeter(meter)}
                          className="p-1 hover:bg-surfaceContainerHighest rounded transition-colors"
                          title="Edit Meter"
                        >
                          <Edit className="h-4 w-4 text-onSurfaceVariant" />
                        </button>
                        <button
                          onClick={() => onDeleteMeter(meter.id)}
                          className="p-1 hover:bg-surfaceContainerHighest rounded transition-colors"
                          title="Delete Meter"
                        >
                          <Trash className="h-4 w-4 text-error" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </div>

      {/* Assigned Assets Section */}
      <div className="mt-4">
        <h4 className="mb-3 text-sm font-bold text-onSurface">
          Assigned Assets
        </h4>
        {group.assignedAssets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {group.assignedAssets.map((asset) => (
              <Badge
                key={asset.id}
                text={asset.name}
                variant="primary"
                className="h-7 px-3 py-1 text-sm"
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-onSurfaceVariant italic">
            No assets assigned to this group
          </div>
        )}
      </div>
    </div>
  );
};

export default MeterGroupDetails;
