import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Tabs } from "@/components/ui/components";
import WorkOrderTab from "./WorkOrderTab";
import CalendarTab from "./CalendarTab";
import WorkOrderForm from "../components/WorkOrderForm";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import { MOCK_WORK_ORDERS, MOCK_WORK_ORDER_SUMMARY } from "../mockData";
import type { WorkOrderFilters, WorkOrder, WorkOrderFormData } from "../types";
import { DEFAULT_WORK_ORDER_FILTERS } from "../types";
import { COVERAGE_QUERY_KEYS } from "@/features/coverage/hooks/useCoverageService";
import type { ClaimNotificationMetadata } from "@/features/notification/types";
import { DEFAULT_NOTIFICATION_IDS } from "@/features/notification/constants";

const WorkOrdersPage: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // State
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(MOCK_WORK_ORDERS);
  const [workOrderFilters, setWorkOrderFilters] = useState<WorkOrderFilters>(
    DEFAULT_WORK_ORDER_FILTERS
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "create"
  );
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );
  const [prefilledDates, setPrefilledDates] = useState<{
    scheduledDate?: string;
    scheduledStartDateTime?: string;
    scheduledEndDateTime?: string;
  }>({});
  const [claimPrefillData, setClaimPrefillData] = useState<Record<string, unknown> | null>(null);
  const [notificationId, setNotificationId] = useState<string | undefined>(undefined);

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(
    null
  );

  // Handlers
  const handleWorkOrderFilterChange = (filters: WorkOrderFilters) => {
    setWorkOrderFilters(filters);
  };

  // Modal handlers
  const handleCreateWorkOrder = () => {
    console.log("handleCreateWorkOrder called");
    setModalMode("create");
    setSelectedWorkOrder(null); // null = create mode
    setPrefilledDates({});
    setIsModalOpen(true);
  };

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    console.log("handleEditWorkOrder called with:", workOrder);
    setModalMode("edit");
    setSelectedWorkOrder(workOrder); // workOrder provided = edit mode
    setIsModalOpen(true);
  };

  const handleViewWorkOrderDetails = (workOrder: WorkOrder) => {
    console.log("handleViewWorkOrderDetails called with:", workOrder);
    setModalMode("view");
    setSelectedWorkOrder(workOrder);
    setIsModalOpen(true);
  };

  const handleDeleteWorkOrder = (workOrder: WorkOrder) => {
    // Show confirmation dialog
    setWorkOrderToDelete(workOrder);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (workOrderToDelete) {
      // Remove work order from list
      setWorkOrders((prev) =>
        prev.filter((wo) => wo.id !== workOrderToDelete.id)
      );
      setIsDeleteDialogOpen(false);
      setWorkOrderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setWorkOrderToDelete(null);
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
    const claimIdFromPrefill =
      (claimPrefillData?.claimId as string | undefined) ??
      (claimPrefillData?.id as string | undefined);

    // Generate new work order
    const newWorkOrder: WorkOrder = {
      id: `WO-${String(Date.now())}`,
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
    };

    // Add to work orders list
    setWorkOrders((prev) => [...prev, newWorkOrder]);

    if (notificationId || claimIdFromPrefill) {
      void import("@/features/notification/services/notificationService").then(({ notificationService }) => {
        const notificationIds = new Set<string>();

        if (notificationId) {
          notificationIds.add(notificationId);
        }

        if (claimIdFromPrefill) {
          const relatedNotifications = notificationService
            .getSnapshot()
            .filter((notification) => {
              if (notification.type !== "claim") {
                return false;
              }

              if (notification.sourceId === claimIdFromPrefill) {
                return true;
              }

              const metadata = notification.metadata as { claimId?: string } | null | undefined;
              return metadata?.claimId === claimIdFromPrefill;
            })
            .map((notification) => notification.id);

          relatedNotifications.forEach((id) => notificationIds.add(id));
        }

        if (notificationIds.size > 0) {
          notificationService.deleteMultipleNotifications(Array.from(notificationIds));
        }
      });
    }

    if (claimIdFromPrefill) {
      void import("@/features/coverage/services/coverageService").then(async ({ linkWorkOrderToClaim }) => {
        await linkWorkOrderToClaim(claimIdFromPrefill, newWorkOrder.id);
        await queryClient.invalidateQueries({ queryKey: COVERAGE_QUERY_KEYS.claims });
      });
    }

    setIsModalOpen(false);
    setPrefilledDates({});
    setClaimPrefillData(null);
    setNotificationId(undefined);
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

  const navigate = useNavigate();

  // Handle navigation from notifications
  useEffect(() => {
    const state = location.state as {
      workOrderId?: string;
      openDetail?: boolean;
      openWorkOrderForm?: boolean;
      claimId?: string;
      claimData?: Record<string, unknown>;
      notificationId?: string;
    } | null;

    let isActive = true;

    const clearNavigationState = () => {
      void navigate(`${location.pathname}${location.search}`, { replace: true });
    };

    // Handle work order detail view
    if (state?.openDetail && state.workOrderId) {
      const workOrder = workOrders.find((wo) => wo.id === state.workOrderId);

      if (workOrder) {
        setModalMode("view");
        setSelectedWorkOrder(workOrder);
        setIsModalOpen(true);
      }
      clearNavigationState();
    }

    const handleClaimNotification = async () => {
      if (!state?.openWorkOrderForm) {
        return;
      }

      const notificationIdentifier = state.notificationId ?? DEFAULT_NOTIFICATION_IDS.WORK_ORDER_CLAIM;
      let latestClaimData: Record<string, unknown> | null = null;

      const claimMetadata = state.claimData as ClaimNotificationMetadata | undefined;
      const claimIdFromState = state.claimId ?? claimMetadata?.claimId;

      if (claimIdFromState) {
        try {
          const { getClaimById } = await import("@/features/coverage/services/coverageService");
          const claim = await getClaimById(claimIdFromState);

          if (claim) {
            latestClaimData = {
              claimId: claim.id,
              claimNumber: claim.claimNumber,
              claimType: claim.type,
              description: `Work order for ${claim.type} claim ${claim.claimNumber}`,
              assets: claim.assets,
              amount: claim.amount,
              status: claim.status,
              workOrderId: claim.workOrderId,
            };
          }
        } catch (error) {
          console.error("Failed to load claim data for notification:", error);
        }
      }

      if (!latestClaimData && state.claimData) {
        latestClaimData = state.claimData;
      }

      if (!isActive) {
        return;
      }

      setClaimPrefillData(latestClaimData);
      setNotificationId(state.notificationId ?? notificationIdentifier);
      setModalMode("create");
      setSelectedWorkOrder(null);
      setIsModalOpen(true);

      clearNavigationState();
    };

    void handleClaimNotification();

    return () => {
      isActive = false;
    };
  }, [location, navigate, workOrders]);

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
          onDeleteWorkOrder={handleDeleteWorkOrder}
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
    <AppLayout>
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
          setClaimPrefillData(null);
          setNotificationId(undefined);
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
        claimPrefillData={claimPrefillData}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Work Order"
        description={
          workOrderToDelete
            ? `Are you sure you want to delete work order "${workOrderToDelete.id} - ${workOrderToDelete.jobTitle}"? This action cannot be undone.`
            : undefined
        }
        itemCount={1}
        itemName={
          workOrderToDelete
            ? `${workOrderToDelete.id} - ${workOrderToDelete.jobTitle}`
            : undefined
        }
        confirmButtonText="Delete Work Order"
      />
    </AppLayout>
  );
};

export default WorkOrdersPage;
