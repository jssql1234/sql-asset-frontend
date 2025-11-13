import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableExtended } from '@/components/DataTableExtended/DataTableExtended';
import type { Meter } from "../../../types/meter";

export type MeterWithConditions = Meter;

export type MeterTableProps = {
  meters: MeterWithConditions[];
  onEdit: (meterId: string) => void;
  onRemove: (meterId: string) => void;
};

// Flat row type for the table
interface MeterRowData {
  id: string;
  meterId: string;
  uom: string;
  conditionTarget: string;
  operator: string;
  value: string | number;
  triggerAction: string;
  triggerMode: string;
  isNoConditions: boolean;
}

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
  // Flatten the hierarchical meter/condition structure into rows
  const tableData = useMemo(() => {
    const rows: MeterRowData[] = [];
    
    meters.forEach((meter) => {
      const conditions = meter.conditions || [];
      
      if (conditions.length === 0) {
        // Add a row indicating no conditions
        rows.push({
          id: `${meter.id}-no-conditions`,
          meterId: meter.id,
          uom: meter.uom,
          conditionTarget: "",
          operator: "",
          value: "",
          triggerAction: "",
          triggerMode: "",
          isNoConditions: true,
        });
      } else {
        // Add a row for each condition
        conditions.forEach((condition) => {
          rows.push({
            id: `${meter.id}-${condition.id}`,
            meterId: meter.id,
            uom: meter.uom,
            conditionTarget: condition.conditionTarget,
            operator: condition.operator,
            value: String(condition.value),
            triggerAction: condition.triggerAction,
            triggerMode: condition.triggerMode,
            isNoConditions: false,
          });
        });
      }
    });
    
    return rows;
  }, [meters]);

  // Define columns for DataTableExtended
  const columns = useMemo<ColumnDef<MeterRowData>[]>(() => [
    {
      accessorKey: "uom",
      header: "UOM",
      size: 120,
      cell: (info) => (
        <div className="font-medium text-onSurface">{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: "conditionTarget",
      header: "Target Reading",
      size: 120,
      cell: (info) => {
        const value = info.getValue() as string;
        return value ? (
          <div className="text-onSurface">{getConditionTargetLabel(value)}</div>
        ) : (
          <div className="text-center text-onSurfaceVariant italic">No conditions set</div>
        );
      },
    },
    {
      accessorKey: "operator",
      header: "Operator",
      size: 120,
      cell: (info) => {
        const value = info.getValue() as string;
        return value ? (
          <div className="text-onSurface">{getOperatorLabel(value)}</div>
        ) : null;
      },
    },
    {
      accessorKey: "value",
      header: "Value",
      size: 100,
      cell: (info) => {
        const value = info.getValue() as string;
        return value ? <div className="text-onSurface">{value}</div> : null;
      },
    },
    {
      accessorKey: "triggerAction",
      header: "Trigger Action",
      size: 200,
      cell: (info) => {
        const value = info.getValue() as string;
        return value ? (
          <div className="text-onSurface">{getTriggerActionLabel(value)}</div>
        ) : null;
      },
    },
    {
      accessorKey: "triggerMode",
      header: "Trigger Mode",
      size: 120,
      cell: (info) => {
        const value = info.getValue() as string;
        return value ? (
          <div className="text-onSurface">{getTriggerModeLabel(value)}</div>
        ) : null;
      },
    },
  ], []);

  // Row actions for edit and delete
  const rowActions = useMemo(() => [
    {
      type: "edit" as const,
      onClick: (row: MeterRowData) => onEdit(row.meterId),
    },
    {
      type: "delete" as const,
      onClick: (row: MeterRowData) => onRemove(row.meterId),
    },
  ], [onEdit, onRemove]);

  return (
    <DataTableExtended
      columns={columns}
      data={tableData}
      showPagination={false}
      rowActions={rowActions}
    />
  );
};

export default MeterTable;
