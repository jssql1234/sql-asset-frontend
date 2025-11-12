import TabHeader from "@/components/TabHeader";
import Search from "@/components/Search";
import SummaryCards from "@/components/SummaryCards";
import WorkOrderTable from "../components/WorkOrderTable";
import type { WorkOrder, WorkOrderFilters, WorkOrderSummary } from "../types";
import { Plus } from '@/assets/icons';

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
    },
    {
      label: "In Progress",
      value: summary.inProgress.toLocaleString(),
    },
    {
      label: "Completed",
      value: summary.completed.toLocaleString(),
    },
    {
      label: "Overdue",
      value: `${summary.overdue.toLocaleString()}`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-1">
      <TabHeader
        title="Work Orders"
        subtitle="Track and manage maintenance work orders and execution"
        customActions={
          <button
            onClick={onCreateWorkOrder}
            disabled={!onCreateWorkOrder}
            className="flex items-center gap-2 px-2.5 py-1.5 text-sm bg-primary text-onPrimary rounded-md hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Create Work Order
          </button>
        }
      />

      <SummaryCards data={summaryCards} />

      <WorkOrderTable
        workOrders={workOrders}
        filters={filters}
        onEditWorkOrder={onEditWorkOrder}
        onViewDetails={onViewDetails}
        onDeleteWorkOrder={onDeleteWorkOrder}
        searchComponent={
          <div className="flex-shrink-0 w-80">
            <Search
              searchValue={filters.search || ""}
              searchPlaceholder="Search by asset or job..."
              onSearch={(value) => onFilterChange({ ...filters, search: value })}
              live={true}
              inputClassName="h-10 w-full"
              showLiveSearchIcon={true}
            />
          </div>
        }
      />
    </div>
  );
};

export default WorkOrderTab;