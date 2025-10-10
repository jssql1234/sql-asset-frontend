import { useMemo } from "react";
import { Badge } from "@/components/ui/components";
import { DataTable } from "@/components/ui/components/Table";
import { type ColumnDef } from "@tanstack/react-table";
import type { WorkOrder, WorkOrderFilters } from "../types";

const PRIORITY_BADGE_VARIANT: Record<
  WorkOrder["priority"],
  "primary" | "red" | "green" | "yellow" | "blue" | "grey"
> = {
  Normal: "primary",
  Emergency: "red",
  Critical: "yellow",
};

const STATUS_BADGE_VARIANT: Record<
  WorkOrder["status"],
  "primary" | "red" | "green" | "yellow" | "blue" | "grey"
> = {
  Pending: "blue",
  'In Progress': "yellow",
  Completed: "green",
  Overdue: "red",
};

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  filters: WorkOrderFilters;
  onEditWorkOrder?: (workOrder: WorkOrder) => void;
  onViewDetails?: (workOrder: WorkOrder) => void;
}

export const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  filters,
  onEditWorkOrder,
  onViewDetails,
}) => {
  // Filter work orders based on current filters
  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((workOrder) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        !searchLower ||
        workOrder.assetName.toLowerCase().includes(searchLower) ||
        workOrder.jobTitle.toLowerCase().includes(searchLower) ||
        workOrder.workOrderNumber.toLowerCase().includes(searchLower);

      const matchesAsset = !filters.assetId || workOrder.assetId === filters.assetId;
      const matchesType = !filters.type || workOrder.type === filters.type;
      const matchesPriority = !filters.priority || workOrder.priority === filters.priority;
      const matchesStatus = !filters.status || workOrder.status === filters.status;
      const matchesServiceBy = !filters.serviceBy || workOrder.serviceBy === filters.serviceBy;
      const matchesAssignedTo =
        !filters.assignedTo || workOrder.assignedTo === filters.assignedTo;

      return (
        matchesSearch &&
        matchesAsset &&
        matchesType &&
        matchesPriority &&
        matchesStatus &&
        matchesServiceBy &&
        matchesAssignedTo
      );
    });
  }, [workOrders, filters]);

  // Table column definitions
  const columns: ColumnDef<WorkOrder>[] = useMemo(
    () => [
      {
        accessorKey: "workOrderNumber",
        header: "ID",
        cell: ({ getValue }) => {
          const woNumber = getValue() as string;
          return (
            <span >
              {woNumber}
            </span>
          );
        },
      },
      {
        accessorKey: "assetName",
        header: "Asset",
        cell: ({ row }) => (
          <div>

            <div className="text-sm text-onSurfaceVariant">{row.original.assetCode}</div>
          </div>
        ),
      },
      {
        accessorKey: "jobTitle",
        header: "Job Title",
        cell: ({ getValue }) => {
          const title = getValue() as string;
          return (
            <div className="max-w-sm">
              <div className="line-clamp-3 text-onSurface leading-relaxed" title={title}>
                {title}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return <span className="label-medium text-onSurface">{type}</span>;
        },
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => {
          const priority = getValue() as WorkOrder["priority"];
          const variant = PRIORITY_BADGE_VARIANT[priority] ?? "grey";
          return <Badge text={priority} variant={variant} className="h-6 px-3" />;
        },
      },
      {
        accessorKey: "scheduledDate",
        header: "Scheduled Date",
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return (
            <div className="text-onSurface">
              {date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          );
        },
      },
      {
        accessorKey: "serviceBy",
        header: "Service By",
        cell: ({ getValue }) => {
          const serviceBy = getValue() as string;
          return <span className="label-medium text-onSurface">{serviceBy}</span>;
        },
      },
      {
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: ({ getValue }) => {
          const assignedTo = getValue() as string | undefined;
          return (
            <span className="label-medium text-onSurface">{assignedTo || "-"}</span>
          );
        },
      },
      {
        accessorKey: "estimatedCost",
        header: "Est. Cost",
        cell: ({ getValue }) => {
          const cost = getValue() as number;
          return (
            <span className="label-medium text-onSurface">
              RM {cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as WorkOrder["status"];
          const variant = STATUS_BADGE_VARIANT[status] ?? "grey";
          return <Badge text={status} variant={variant} className="h-6 px-3" />;
        },
      },
    ],
    [onViewDetails]
  );

  // Handle row double click
  const handleTableDoubleClick = (e: React.MouseEvent) => {
    console.log("Double click detected on table");
    // Find the closest table row (tr element)
    const row = (e.target as HTMLElement).closest('tr');
    console.log("Found row:", row);
    if (row) {
      // Get row index from the data array
      const rows = document.querySelectorAll('.work-order-table tbody tr');
      const rowIndex = Array.from(rows).indexOf(row);
      console.log("Row index:", rowIndex);
      
      if (rowIndex >= 0 && rowIndex < filteredWorkOrders.length) {
        const workOrder = filteredWorkOrders[rowIndex];
        console.log("Found work order:", workOrder);
        if (workOrder && onEditWorkOrder) {
          onEditWorkOrder(workOrder);
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        .work-order-table tbody tr {
          cursor: pointer;
          user-select: none;
        }
        .work-order-table tbody tr:hover {
          background-color: rgba(var(--color-primary-rgb, 33, 150, 243), 0.08);
        }
      `}</style>

      <div className="work-order-table" onDoubleClick={handleTableDoubleClick}>
        <DataTable
          columns={columns}
          data={filteredWorkOrders}
          showPagination={true}
          className="border border-outline"
        />
      </div>
    </div>
  );
};

export default WorkOrderTable;
