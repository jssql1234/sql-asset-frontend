/**
 * Work Order Calendar Component
 * 
 * A specialized calendar for displaying work orders with custom event rendering
 * and work order-specific interactions.
 */

import { useCallback, useMemo } from "react";
import { Calendar, type CalendarEvent } from "@/components/Calendar";
import "@/styles/Calendar.css";
import type { 
  DateSelectArg, 
  EventClickArg,
  EventContentArg 
} from "@fullcalendar/core";
import type { WorkOrder } from "../types";

export interface WorkOrderCalendarProps {
  /** Array of work orders to display on calendar */
  workOrders: WorkOrder[];
  
  /** Callback when a date is selected (for creating new work order) */
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  
  /** Callback when a work order event is clicked */
  onEventClick?: (workOrder: WorkOrder) => void;
  
  /** Initial view */
  initialView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";
  
  /** Enable date selection for creating work orders */
  selectable?: boolean;
  
  /** Enable drag and drop */
  editable?: boolean;
}

/**
 * Get color based on priority
 */
const getPriorityColor = (priority: WorkOrder["priority"]): { bg: string; text: string } => {
  switch (priority) {
    case "Critical":
      return { bg: "#f44336", text: "#ffffff" };
    case "Emergency":
      return { bg: "#ef9a9a", text: "#b71c1c" };
    case "Normal":
      return { bg: "#fff59d", text: "#f57f17" };
    default:
      return { bg: "#e0e0e0", text: "#424242" };
  }
};

/**
 * Get color based on status
 */
const getStatusColor = (status: WorkOrder["status"]): { bg: string; text: string } => {
  switch (status) {
    case "Completed":
      return { bg: "#81c784", text: "#1b5e20" };
    case "In Progress":
      return { bg: "#64b5f6", text: "#0d47a1" };
    case "Scheduled":
      return { bg: "#9fa8da", text: "#1a237e" };
    case "Overdue":
      return { bg: "#e57373", text: "#b71c1c" };
    default:
      return { bg: "#e0e0e0", text: "#424242" };
  }
};

/**
 * Work Order Calendar
 * 
 * Displays work orders in a calendar view with custom rendering based on
 * priority, status, and work order type.
 */
export const WorkOrderCalendar: React.FC<WorkOrderCalendarProps> = ({
  workOrders,
  onDateSelect,
  onEventClick,
  initialView = "dayGridMonth",
  selectable = false,
  editable = false,
}) => {
  // Convert work orders to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return workOrders.map((workOrder) => {
      const priorityColor = getPriorityColor(workOrder.priority);
      const statusColor = getStatusColor(workOrder.status);
      
      // Use priority color for border, status color for background
      return {
        id: workOrder.id,
        title: workOrder.jobTitle,
        start: workOrder.scheduledDate,
        end: workOrder.completedDate || workOrder.scheduledDate,
        allDay: !workOrder.startDate, // All day if no specific start time
        backgroundColor: statusColor.bg,
        borderColor: priorityColor.bg,
        textColor: statusColor.text,
        extendedProps: {
          workOrder,
          priority: workOrder.priority,
          status: workOrder.status,
          type: workOrder.type,
          progress: workOrder.progress,
          assetName: workOrder.assetName,
          workOrderNumber: workOrder.workOrderNumber,
        },
      };
    });
  }, [workOrders]);

  // Handle event click
  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const workOrder = clickInfo.event.extendedProps.workOrder as WorkOrder;
    if (onEventClick) {
      onEventClick(workOrder);
    }
  }, [onEventClick]);

  // Custom event content renderer
  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { workOrderNumber, assetName, priority, status, progress } = eventInfo.event.extendedProps;
    
    return (
      <div className="flex flex-col gap-0.5 p-1 overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-xs truncate">
            {eventInfo.event.title}
          </span>
          {eventInfo.view.type === "dayGridMonth" && (
            <span className="text-[10px] opacity-75">
              {priority}
            </span>
          )}
        </div>
        
        {eventInfo.view.type !== "dayGridMonth" && (
          <>
            <div className="text-[10px] opacity-90 truncate">
              {workOrderNumber} • {assetName}
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-1.5 py-0.5 bg-white/30 rounded">
                {status}
              </span>
              {progress !== undefined && (
                <span className="px-1.5 py-0.5 bg-white/30 rounded">
                  {progress}%
                </span>
              )}
            </div>
          </>
        )}
      </div>
    );
  }, []);

  // Handle date select
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo);
    }
  }, [onDateSelect]);

  return (
    <div className="work-order-calendar">
      <Calendar
        events={calendarEvents}
        initialView={initialView}
        selectable={selectable}
        editable={editable}
        weekends={true}
        dayMaxEvents={3}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
        }}
        onDateSelect={handleDateSelect}
        onEventClick={handleEventClick}
        eventContent={renderEventContent}
        nowIndicator={true}
        selectMirror={true}
        height="auto"
      />
    </div>
  );
};

export default WorkOrderCalendar;
