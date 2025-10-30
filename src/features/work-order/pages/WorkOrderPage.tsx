import { useState } from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Tabs } from "@/components/ui/components";
import WorkOrderTab from "./WorkOrderTab";
import CalendarTab from "./CalendarTab";
import WorkOrderForm from "../components/WorkOrderForm";
import { MOCK_WORK_ORDERS, MOCK_WORK_ORDER_SUMMARY } from "../mockData";
import type { WorkOrderFilters, WorkOrder, WorkOrderFormData } from "../types";
import { DEFAULT_WORK_ORDER_FILTERS } from "../types";

const WorkOrdersPage: React.FC = () => {
  // State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [workOrderFilters, setWorkOrderFilters] = useState<WorkOrderFilters>(
    DEFAULT_WORK_ORDER_FILTERS
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );
  const [prefilledDates, setPrefilledDates] = useState<{
    scheduledDate?: string;
    scheduledStartDateTime?: string;
    scheduledEndDateTime?: string;
  }>({});

  // Handlers
  const handleWorkOrderFilterChange = (filters: WorkOrderFilters) => {
    setWorkOrderFilters(filters);
  };

  const handleResetWorkOrderFilters = () => {
    setWorkOrderFilters(DEFAULT_WORK_ORDER_FILTERS);
  };

  // Modal handlers
  const handleCreateWorkOrder = () => {
    console.log("handleCreateWorkOrder called");
    setSelectedWorkOrder(null); // null = create mode
    setPrefilledDates({});
    setIsModalOpen(true);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    console.log("handleEditWorkOrder called with:", workOrder);
    setSelectedWorkOrder(workOrder); // workOrder provided = edit mode
    setIsModalOpen(true);
  };

  const handleViewWorkOrderDetails = (workOrder: WorkOrder) => {
    // For now, open edit modal to view/edit details
    handleEditWorkOrder(workOrder);
  };

  const handleCalendarEventClick = (workOrder: WorkOrder) => {
    console.log("Calendar event clicked:", workOrder);
    // Open edit modal when event is clicked
    handleEditWorkOrder(workOrder);
  };

  const handleCalendarDateSelect = (selectInfo: any) => {
    console.log("Date selected:", selectInfo);
    console.log("Start date:", selectInfo.startStr);
    console.log("End date:", selectInfo.endStr);
    console.log("All day:", selectInfo.allDay);

    // Convert dates to datetime-local format
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);

    // Format as YYYY-MM-DDTHH:mm for datetime-local input
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Open create work order modal with pre-filled dates
    setSelectedWorkOrder(null); // null = create mode
    setPrefilledDates({
      scheduledDate: selectInfo.startStr,
      scheduledStartDateTime: formatDateTime(startDate),
      scheduledEndDateTime: formatDateTime(endDate),
    });
    setIsModalOpen(true);

    // Clear the selection after handling
    selectInfo.view.calendar.unselect();
  };

  // Form submission handlers
  const handleSubmitCreateWorkOrder = (formData: WorkOrderFormData) => {
    // Generate new work order
    const newWorkOrder: WorkOrder = {
      id: `WO-${Date.now()}`,
      workOrderNumber: formData.workOrderNumber,
      assetId: formData.assetId,
      assetName: formData.assetName,
      assetCode: formData.assetId, // Simplified for now
      jobTitle: formData.jobTitle,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      serviceBy: formData.serviceBy,
      assignedTo: formData.assignedTo,
      requestedDate: new Date().toISOString().split("T")[0],
      scheduledDate: formData.scheduledDate,
      scheduledStartDateTime: formData.scheduledStartDateTime,
      scheduledEndDateTime: formData.scheduledEndDateTime,
      actualStartDateTime: formData.actualStartDateTime,
      actualEndDateTime: formData.actualEndDateTime,
      estimatedCost: formData.estimatedCost,
      actualCost: formData.actualCost,
      notes: formData.notes,
      progress: 0,
      warrantyId: formData.warrantyId,
    };

    // Add to work orders list
    setWorkOrders((prev) => [...prev, newWorkOrder]);

    setIsModalOpen(false);
    setPrefilledDates({});
  };

  const handleSubmitEditWorkOrder = (formData: WorkOrderFormData) => {
    if (!selectedWorkOrder) return;

    // Merge form data with existing work order
    const updatedWorkOrder: WorkOrder = {
      ...selectedWorkOrder,
      ...formData,
    };

    // Update work order in list
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === updatedWorkOrder.id ? updatedWorkOrder : wo))
    );
    setIsModalOpen(false);
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
        />
      ),
    },
  ];

  return (
    <AppLayout
      breadcrumbs={[{ label: "Asset Maintenance" }, { label: "Work Orders" }]}
    >
      <div className="flex min-h-full flex-col gap-4 overflow-hidden">
        <Tabs tabs={tabs} defaultValue="workorders" />
      </div>

      {/* Unified Work Order Modal */}
      <WorkOrderForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorkOrder(null);
          setPrefilledDates({});
        }}
        onSubmit={(formData) => {
          if (selectedWorkOrder) {
            handleSubmitEditWorkOrder(formData);
          } else {
            handleSubmitCreateWorkOrder(formData);
          }
        }}
        workOrder={selectedWorkOrder}
        prefilledDates={prefilledDates}
      />
    </AppLayout>
  );
};

export default WorkOrdersPage;
