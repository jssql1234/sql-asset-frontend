import { useState, useMemo } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { Tabs } from "@/components/ui/components";
import WorkOrderTab from "./WorkOrderTab";
import CalendarTab from "./CalendarTab";
import {
  MOCK_WORK_ORDERS_SCHEDULE,
  MOCK_WORK_ORDERS,
  MOCK_WORK_ORDER_SUMMARY,
  MOCK_ASSETS,
  MOCK_TECHNICIANS,
  MOCK_VENDORS,
} from "../mockData";
import type {
  WorkOrderFilters,
  WorkOrders,
  WorkOrder,
} from "../types";
import {
  DEFAULT_WORK_ORDER_FILTERS,
} from "../types";

const WorkOrdersPage: React.FC = () => {
  // State
  const [schedules] = useState<WorkOrders[]>(MOCK_WORK_ORDERS_SCHEDULE);
  const [workOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [workOrderFilters, setWorkOrderFilters] = useState<WorkOrderFilters>(
    DEFAULT_WORK_ORDER_FILTERS
  );

  // Prepare asset options for dropdowns
  const assetOptions = useMemo(
    () =>
      MOCK_ASSETS.map((asset) => ({
        value: asset.id,
        label: `${asset.name} (${asset.code})`,
      })),
    []
  );

  // Prepare technician options
  const technicianOptions = useMemo(() => {
    const technicians = MOCK_TECHNICIANS.map((tech) => ({
      value: tech.name,
      label: tech.name,
    }));
    const vendors = MOCK_VENDORS.map((vendor) => ({
      value: vendor.name,
      label: vendor.name,
    }));
    return [...technicians, ...vendors];
  }, []);

  // Handlers
  const handleWorkOrderFilterChange = (filters: WorkOrderFilters) => {
    setWorkOrderFilters(filters);
  };

  const handleResetWorkOrderFilters = () => {
    setWorkOrderFilters(DEFAULT_WORK_ORDER_FILTERS);
  };

  // Modal handlers (placeholder implementations)
  const handleCreateWorkOrder = () => {
    console.log("Create work order modal");
    // TODO: Implement modal
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    console.log("Edit work order:", workOrder);
    // TODO: Implement modal
  };

  const handleViewWorkOrderDetails = (workOrder: WorkOrder) => {
    console.log("View work order details:", workOrder);
    // TODO: Implement modal
  };

  const handleCalendarEventClick = (event: any) => {
    console.log("Calendar event clicked:", event);
    // TODO: Implement event details modal
  };

  // Tabs configuration
  const tabs = [
    {
      value: "workorders",
      label: "Work Orders",
      content: (
        <WorkOrderTab
          workOrders={workOrders}
          filters={workOrderFilters}
          summary={MOCK_WORK_ORDER_SUMMARY}
          onFilterChange={handleWorkOrderFilterChange}
          onResetFilters={handleResetWorkOrderFilters}
          onCreateWorkOrder={handleCreateWorkOrder}
          onEditWorkOrder={handleEditWorkOrder}
          onViewDetails={handleViewWorkOrderDetails}
        />
      ),
    },
    {
      value: "calendar",
      label: "Calendar View",
      content: (
        <CalendarTab
          schedules={schedules}
          workOrders={workOrders}
          onEventClick={handleCalendarEventClick}
        />
      ),
    },
  ];

  return (
    <AssetLayout activeSidebarItem="work-orders">
      <div className="flex min-h-full flex-col gap-4 overflow-auto">
        <Tabs tabs={tabs} defaultValue="workorders" />
      </div>
    </AssetLayout>
  );
};

export default WorkOrdersPage;
