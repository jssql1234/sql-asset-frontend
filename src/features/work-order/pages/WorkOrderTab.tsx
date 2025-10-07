import { Card, Button } from "@/components/ui/components";
import { Input } from "@/components/ui/components/Input";
import TabHeader from "@/components/TabHeader";
import SummaryCards from "@/components/SummaryCards";
import WorkOrderTable from "../components/WorkOrderTable";
import type {
  WorkOrder,
  WorkOrderFilters,
  WorkOrderSummary,
} from "../types";

interface WorkOrderTabProps {
  workOrders: WorkOrder[];
  filters: WorkOrderFilters;
  summary: WorkOrderSummary;
  onFilterChange: (filters: WorkOrderFilters) => void;
  onResetFilters: () => void;
  onCreateWorkOrder?: () => void;
  onEditWorkOrder?: (workOrder: WorkOrder) => void;
  onViewDetails?: (workOrder: WorkOrder) => void;
}

export const WorkOrderTab = ({
  workOrders,
  filters,
  summary,
  onFilterChange,
  onResetFilters,
  onCreateWorkOrder,
  onEditWorkOrder,
  onViewDetails,
}: WorkOrderTabProps) => {
  const handleChange = (key: keyof WorkOrderFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const summaryCards = [
    {
      label: "Total Work Orders",
      value: summary.totalWorkOrders.toLocaleString(),
      description: "All work orders",
    },
    {
      label: "In Progress",
      value: summary.inProgress.toLocaleString(),
      description: "Currently active",
      tone: "warning" as const,
    },
    {
      label: "Completed",
      value: summary.completed.toLocaleString(),
      description: "Successfully finished",
      tone: "success" as const,
    },
    {
      label: "Overdue",
      value: `${summary.avgCompletionTime.toFixed(1)}d`,
      description: "Average completion time",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-2">
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

      {/* Filters */}
      <Card className="border border-outline bg-surfaceContainer p-4">
        <div className="grid grid-cols-1">
          <div>
            <Input
              type="text"
              placeholder="Search by asset or job..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onResetFilters}>
            Clear Filters
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 border border-outline bg-surfaceContainer p-0 min-h-[500px]">
        <div className="border-t border-outline overflow-auto p-4">
          <WorkOrderTable
            workOrders={workOrders}
            filters={filters}
            onEditWorkOrder={onEditWorkOrder}
            onViewDetails={onViewDetails}
          />
        </div>
      </Card>
    </div>
  );
};

export default WorkOrderTab;
