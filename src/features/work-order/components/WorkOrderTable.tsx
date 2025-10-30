import { useMemo } from "react";
import { Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import type { WorkOrder, WorkOrderFilters } from "../types";
import { useSidebar } from "@/layout/sidebar/SidebarContext";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/layout/sidebar/SidebarConstant";

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

const WARRANTY_STATUS_BADGE_VARIANT: Record<
  "No Warranty" | "Claimable" | "Claimed",
  "primary" | "red" | "green" | "yellow" | "blue" | "grey"
> = {
  "No Warranty": "grey",
  Claimable: "green",
  Claimed: "blue",
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
  const { state } = useSidebar();
  const sidebarWidth = state === "collapsed" ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

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
          return <div className="w-30">{ woNumber }</div>;
        },
        className: "w-24",
      },
      {
        accessorKey: "assetName",
        header: "Asset",
        cell: ({ row }) => (
          <div>
            <div className="text-sm text-onSurfaceVariant">
              {row.original.assetCode}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "jobTitle",
        header: "Job Title",
        cell: ({ getValue }) => {
          const title = getValue() as string;
          return (
            <div className="max-w-xs w-50">
              <div
                className="line-clamp-3 text-onSurface leading-relaxed"
                title={title}
              >
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
          return (
            <Badge text={priority} variant={variant} className="h-6 px-3" />
          );
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
          return (
            <span className="label-medium text-onSurface">{serviceBy}</span>
          );
        },
      },
      {
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: ({ getValue }) => {
          const assignedTo = getValue() as string | undefined;
          return (
            <span className="label-medium text-onSurface">
              {assignedTo || "-"}
            </span>
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
              RM{" "}
              {cost.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
      {
        accessorKey: "warrantyStatus",
        header: "Warranty",
        cell: ({ getValue }) => {
          const warrantyStatus =
            (getValue() as WorkOrder["warrantyStatus"]) || "No Warranty";
          const variant =
            WARRANTY_STATUS_BADGE_VARIANT[warrantyStatus] ?? "grey";
          return (
            <Badge
              text={warrantyStatus}
              variant={variant}
              className="h-6 px-3"
            />
          );
        },
      },
    ],
    [onViewDetails]
  );

  return (
      <div
        className="flex flex-col gap-4 overflow-x-auto transition-[max-width] duration-100 ease-linear"
        style={{
          maxWidth: `calc(100vw - ${sidebarWidth} - 3rem)`,
        }}
      >
        <DataTableExtended
          columns={columns}
          data={filteredWorkOrders}
          showPagination={true}
          onRowDoubleClick={onEditWorkOrder}
        />
      </div>
  );
};

export default WorkOrderTable;
