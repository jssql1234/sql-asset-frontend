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
  EventContentArg,
  EventChangeArg
} from "@fullcalendar/core";
import type { WorkOrder } from "../types";

export interface WorkOrderCalendarProps {
  /** Array of work orders to display on calendar */
  workOrders: WorkOrder[];
  
  /** Callback when a date is selected (for creating new work order) */
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  
  /** Callback when a work order event is clicked */
  onEventClick?: (workOrder: WorkOrder) => void;
  
  /** Callback when an event is moved or resized */
  onEventChange?: (workOrder: WorkOrder, newStart: Date, newEnd: Date | null) => void;
  
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
    case "Normal":
      return { bg: "#2196f3", text: "#ffffff" }; // Blue
    case "Critical":
      return { bg: "#ffc107", text: "#000000" }; // Yellow
    case "Emergency":
      return { bg: "#f44336", text: "#ffffff" }; // Red
    default:
      return { bg: "#9e9e9e", text: "#ffffff" }; // Grey
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
  onEventChange,
  initialView = "dayGridMonth",
  selectable = false,
  editable = false,
}) => {
  // Convert work orders to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return workOrders.map((workOrder) => {
      const priorityColor = getPriorityColor(workOrder.priority);
      
      // Determine event dates and timing
      // Priority: Use scheduledStartDateTime/scheduledEndDateTime if available
      // Fallback: Use actualStartDateTime/actualEndDateTime for completed work
      // Final fallback: Use scheduledDate as all-day event
      let startDate: string;
      let endDate: string | undefined;
      let isAllDay = false;

      if (workOrder.scheduledStartDateTime && workOrder.scheduledEndDateTime) {
        // Use scheduled datetime fields (with time component)
        startDate = workOrder.scheduledStartDateTime;
        endDate = workOrder.scheduledEndDateTime;
        isAllDay = false;
      } else if (workOrder.actualStartDateTime && workOrder.actualEndDateTime) {
        // Use actual datetime fields for completed work
        startDate = workOrder.actualStartDateTime;
        endDate = workOrder.actualEndDateTime;
        isAllDay = false;
      } else if (workOrder.scheduledDate) {
        // Fallback to old date fields (all-day events)
        startDate = workOrder.scheduledDate;
        endDate = workOrder.completedDate || workOrder.scheduledDate;
        isAllDay = true;
      } else {
        // Default fallback
        startDate = new Date().toISOString().split('T')[0];
        endDate = startDate;
        isAllDay = true;
      }
      
      // Use priority color for background only (no border)
      return {
        id: workOrder.id,
        title: workOrder.jobTitle,
        start: startDate,
        end: endDate,
        allDay: isAllDay,
        backgroundColor: priorityColor.bg,
        borderColor: "transparent",
        textColor: priorityColor.text,
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
    const { workOrderNumber, assetName, status, progress } = eventInfo.event.extendedProps;
    
    return (
      <div className="flex flex-col gap-0.5 p-1 overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-xs truncate">
            {eventInfo.event.title}
          </span>
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

  // Handle event change (drag/drop or resize)
  const handleEventChange = useCallback((changeInfo: EventChangeArg) => {
    const workOrder = changeInfo.event.extendedProps.workOrder as WorkOrder;
    const newStart = changeInfo.event.start;
    const newEnd = changeInfo.event.end;
    
    if (onEventChange && newStart) {
      onEventChange(workOrder, newStart, newEnd);
    }
  }, [onEventChange]);

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
        onEventChange={handleEventChange}
        eventContent={renderEventContent}
        nowIndicator={true}
        selectMirror={true}
        height="auto"
      />
    </div>
  );
};

export default WorkOrderCalendar;
