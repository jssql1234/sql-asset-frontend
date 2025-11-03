import TabHeader from "@/components/TabHeader";
import Search from "@/components/Search";
import SummaryCards from "@/components/SummaryCards";
import WorkOrderTable from "../components/WorkOrderTable";
import type { WorkOrder, WorkOrderFilters, WorkOrderSummary } from "../types";

interface WorkOrderTabProps {
  workOrders: WorkOrder[];
  filters: WorkOrderFilters;
  summary: WorkOrderSummary;
  onFilterChange: (filters: WorkOrderFilters) => void;
  onCreateWorkOrder?: () => void;
  onEditWorkOrder?: (workOrder: WorkOrder) => void;
  onViewDetails?: (workOrder: WorkOrder) => void;
  onDeleteWorkOrder?: (workOrder: WorkOrder) => void;
}

export const WorkOrderTab = ({
  workOrders,
  filters,
  summary,
  onFilterChange,
  onCreateWorkOrder,
  onEditWorkOrder,
  onViewDetails,
  onDeleteWorkOrder,
}: WorkOrderTabProps) => {
  const summaryCards = [
    {
      label: "Total Work Orders",
      value: summary.totalWorkOrders.toLocaleString(),
      // description: "All work orders",
    },
    {
      label: "In Progress",
      value: summary.inProgress.toLocaleString(),
      // description: "Currently active",
      // tone: "warning" as const,
    },
    {
      label: "Completed",
      value: summary.completed.toLocaleString(),
      // description: "Successfully finished",
      // tone: "success" as const,
    },
    {
      label: "Overdue",
      value: `${summary.overdue.toLocaleString()}`,
      // description: "Average completion time",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-1">
      <TabHeader
        title="Work Orders"
        subtitle="Track and manage maintenance work orders and execution"
        actions={[
          {
            label: "Create Work Order",
            onAction: onCreateWorkOrder,
            variant: "default",
            size: "sm",
            disabled: !onCreateWorkOrder,
          },
        ]}
      />

      <SummaryCards data={summaryCards} />

      <Search
        searchValue={filters.search || ""}
        searchPlaceholder="Search by asset or job..."
        onSearch={(value) => onFilterChange({ ...filters, search: value })}
        live={true}
        showLiveSearchIcon={true}
      />

      <WorkOrderTable
        workOrders={workOrders}
        filters={filters}
        onEditWorkOrder={onEditWorkOrder}
        onViewDetails={onViewDetails}
        onDeleteWorkOrder={onDeleteWorkOrder}
      />
    </div>
  );
};

export default WorkOrderTab;
