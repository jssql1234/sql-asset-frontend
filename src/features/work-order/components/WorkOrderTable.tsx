import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import TableColumnVisibility from "@/components/ui/components/Table/TableColumnVisibility";
import type { WorkOrder, WorkOrderFilters } from "../types";
import { useSidebar } from "@/layout/sidebar/SidebarContext";
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "@/layout/sidebar/SidebarConstant";

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
  onDeleteWorkOrder?: (workOrder: WorkOrder) => void;
  searchComponent?: React.ReactNode;
}

export const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  filters,
  onEditWorkOrder,
  onViewDetails,
  onDeleteWorkOrder,
  searchComponent,
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
        workOrder.id.toLowerCase().includes(searchLower);

      const matchesAsset = !filters.assetId || workOrder.assetId === filters.assetId;
      const matchesType = !filters.type || workOrder.type === filters.type;
      const matchesStatus = !filters.status || workOrder.status === filters.status;
      const matchesServiceBy = !filters.serviceBy || workOrder.serviceBy === filters.serviceBy;
      const matchesAssignedTo =
        !filters.assignedTo || workOrder.assignedTo === filters.assignedTo;

      return (
        matchesSearch &&
        matchesAsset &&
        matchesType &&
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
        id: "id",
        accessorKey: "id",
        header: "ID",
        cell: ({ getValue }) => {
          const id = getValue() as string;
          return <div className="w-30">{id}</div>;
        },
      },
      {
        id: "assetName",
        accessorKey: "assetName",
        header: "Asset",
        cell: ({ row }) => {
          const assetName = row.original.assetName;

          return (
            <div title={assetName}>
              <Badge
                text={assetName}
                variant="grey"
                className="h-7 px-3 py-1"
              />
            </div>
          );
        },
      },
      {
        id: "jobTitle",
        accessorKey: "jobTitle",
        header: "Job Title",
        cell: ({ getValue }) => {
          const title = getValue() as string;
          return (
            <div className="max-w-xs w-80">
              <div
                className="line-clamp-2 text-onSurface leading-relaxed"
                title={title}
              >
                {title}
              </div>
            </div>
          );
        },
      },
      {
        id: "type",
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }) => {
          const type = getValue() as string;
          return <span className="label-medium text-onSurface">{type}</span>;
        },
      },
      {
        id: "scheduledDate",
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
        id: "serviceBy",
        accessorKey: "serviceBy",
        header: "Service By",
        cell: ({ getValue }) => {
          const serviceBy = getValue() as string;
          return (
            <div className="label-medium text-onSurface w-30">{serviceBy}</div>
          );
        },
      },
      {
        id: "assignedTo",
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: ({ getValue }) => {
          const assignedTo = getValue() as string | undefined;
          return (
            <div className="label-medium text-onSurface w-35">
              {assignedTo || "-"}
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as WorkOrder["status"];
          const variant = STATUS_BADGE_VARIANT[status] ?? "grey";
          return <Badge text={status} variant={variant} className="h-6 px-3" />;
        },
      },
    ],
    [],
  );

  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<WorkOrder>[]>(columns);

  // Row actions configuration
  const rowActions = useMemo(() => {
    const actions = [];

    if (onViewDetails) {
      actions.push({
        type: 'view' as const,
        onClick: (row: WorkOrder) => onViewDetails(row),
      });
    }

    if (onEditWorkOrder) {
      actions.push({
        type: 'edit' as const,
        onClick: (row: WorkOrder) => onEditWorkOrder(row),
      });
    }

    if (onDeleteWorkOrder) {
      actions.push({
        type: 'delete' as const,
        onClick: (row: WorkOrder) => onDeleteWorkOrder(row),
      });
    }

    return actions;
  }, [onViewDetails, onEditWorkOrder, onDeleteWorkOrder]);

  return (
    <div
      className="flex flex-col gap-4 overflow-x-auto transition-[max-width] duration-100 ease-linear"
      style={{
        maxWidth: `calc(100vw - ${sidebarWidth} - 3rem)`,
      }}
    >
      <style>{`
        [data-table-container] th:last-child {
          background-color: var(--color-surface-container);
        }
      `}</style>

      <div className="flex items-center justify-between gap-4">
        <TableColumnVisibility
          columns={columns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
        {searchComponent}
      </div>

      <div data-table-container>
        <DataTableExtended
          columns={visibleColumns}
          data={filteredWorkOrders}
          showPagination={true}
          rowActions={rowActions}
        />
      </div>
    </div>
  );
};

export default WorkOrderTable