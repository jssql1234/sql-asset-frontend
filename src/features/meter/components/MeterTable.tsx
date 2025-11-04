import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/components/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/components";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { Meter } from "../../../types/meter";

export type MeterWithConditions = Meter;

export type MeterTableProps = {
  meters: MeterWithConditions[];
  onEdit: (meterId: string) => void;
  onRemove: (meterId: string) => void;
};

// Mapping functions to convert stored values to display labels
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

const MeterTable = ({ meters, onEdit, onRemove }: MeterTableProps) => {
  if (meters.length === 0) {
    return (
      <div className="rounded border border-dashed border-outlineVariant bg-surfaceContainer p-6 text-center text-sm text-onSurfaceVariant">
        No meters defined yet. Use "Add meter" to start tracking readings.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-outlineVariant bg-surface">
      <Table className="min-w-[1200px]">
        <TableHeader className="bg-secondaryContainer">
          <TableRow>
            <TableHead
              rowSpan={2}
              className="w-[120px] border-r border-outlineVariant px-4 py-3 text-xs font-semibold uppercase tracking-wide text-onSurfaceVariant"
            >
              UOM
            </TableHead>
            <TableHead
              colSpan={5}
              className="border-r border-outlineVariant px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-onSurfaceVariant"
            >
              Condition
            </TableHead>
            <TableHead
              rowSpan={2}
              className="w-0 text-right text-xs font-semibold text-onSurfaceVariant"
            >
              
            </TableHead>
          </TableRow>
          <TableRow>
            <TableHead className="w-[15%] px-4 py-3 text-xs font-semibold text-onSurfaceVariant">
              Condition Target
            </TableHead>
            <TableHead className="w-[12%] px-4 py-3 text-xs font-semibold text-onSurfaceVariant">
              Operator
            </TableHead>
            <TableHead className="w-[14%] px-4 py-3 text-xs font-semibold text-onSurfaceVariant">
              Value
            </TableHead>
            <TableHead className="w-[24%] px-4 py-3 text-xs font-semibold text-onSurfaceVariant">
              Trigger Action
            </TableHead>
            <TableHead className="w-[15%] border-r border-outlineVariant px-4 py-3 text-xs font-semibold text-onSurfaceVariant">
              Trigger Mode
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meters.map((meter) => {
            const conditions = meter.conditions || [];
            const hasConditions = conditions.length > 0;

            if (!hasConditions) {
              return (
                <TableRow key={meter.id} className="text-sm">
                  <TableCell className="border-r border-outlineVariant bg-surfaceContainerLow px-4 py-3 font-medium text-onSurface">
                    {meter.uom}
                  </TableCell>
                  <TableCell
                    colSpan={5}
                    className="border-r border-outlineVariant px-4 py-4 text-center text-onSurfaceVariant"
                  >
                    No conditions set
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(meter.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onRemove(meter.id)}
                            className="text-error focus:text-error"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            return conditions.map((condition, index) => (
              <TableRow key={`${meter.id}-${condition.id}`} className="text-sm">
                {index === 0 && (
                  <TableCell
                    rowSpan={conditions.length}
                    className="border-r border-outlineVariant bg-surfaceContainerLow px-4 py-3 font-medium text-onSurface"
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
                <TableCell className="border-r border-outlineVariant px-4 py-3 text-onSurface">
                  {getTriggerModeLabel(condition.triggerMode)}
                </TableCell>
                {index === 0 && (
                  <TableCell
                    rowSpan={conditions.length}
                    className="px-4 py-2"
                  >
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => onEdit(meter.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onRemove(meter.id)}
                            className="text-error focus:text-error"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ));
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MeterTable;
