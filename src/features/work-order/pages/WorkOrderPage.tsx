import { useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { Tabs } from "@/components/ui/components";
import WorkOrderTab from "./WorkOrderTab";
import CalendarTab from "./CalendarTab";
import {
  MOCK_WORK_ORDERS,
  MOCK_WORK_ORDER_SUMMARY,
} from "../mockData";
import type {
  WorkOrderFilters,
  WorkOrder,
} from "../types";
import {
  DEFAULT_WORK_ORDER_FILTERS,
} from "../types";

const WorkOrdersPage: React.FC = () => {
  // State
  const [workOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [workOrderFilters, setWorkOrderFilters] = useState<WorkOrderFilters>(
    DEFAULT_WORK_ORDER_FILTERS
  );

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

  const handleCalendarEventClick = (workOrder: WorkOrder) => {
    console.log("Calendar event clicked:", workOrder);
    handleViewWorkOrderDetails(workOrder);
    // TODO: Implement event details modal
  };

  const handleCalendarDateSelect = (selectInfo: any) => {
    console.log("Date selected:", selectInfo);
    console.log("Start date:", selectInfo.startStr);
    console.log("End date:", selectInfo.endStr);
    console.log("All day:", selectInfo.allDay);
    
    // TODO: Implement create work order modal with pre-filled dates
    // For now, trigger the create work order handler
    handleCreateWorkOrder();
    
    // Clear the selection after handling
    selectInfo.view.calendar.unselect();
  };

  const handleCalendarEventChange = (workOrder: WorkOrder, newStart: Date, newEnd: Date | null) => {
    console.log("Event changed:", workOrder);
    console.log("New start date:", newStart);
    console.log("New end date:", newEnd);
    
    // TODO: Update work order in backend
    // For now, just log the change
    console.log(`Work Order ${workOrder.workOrderNumber} moved to ${newStart.toISOString()}`);
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
          workOrders={workOrders}
          onEventClick={handleCalendarEventClick}
          onDateSelect={handleCalendarDateSelect}
          onEventChange={handleCalendarEventChange}
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
