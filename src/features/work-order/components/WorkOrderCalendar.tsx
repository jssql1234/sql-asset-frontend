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
  workOrders: WorkOrder[];
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventClick?: (workOrder: WorkOrder) => void;
  onEventChange?: (workOrder: WorkOrder, newStart: Date, newEnd: Date | null) => void;
  initialView?: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";
  selectable?: boolean;
  editable?: boolean;
}

const getMaintenanceTypeColor = (type: string): { bg: string; text: string } => {
  switch (type) {
    case "Preventive":
      return { bg: "#2196f3", text: "#ffffff" };
    case "Corrective":
      return { bg: "#ffc107", text: "#000000" };
    case "Emergency":
      return { bg: "#f44336", text: "#ffffff" };
    case "Upgrade/Modify":
      return { bg: "#9c27b0", text: "#ffffff" };
    default:
      return { bg: "#9e9e9e", text: "#ffffff" };
  }
};

export const WorkOrderCalendar = ({
  workOrders,
  onDateSelect,
  onEventClick,
  onEventChange,
  initialView = "dayGridMonth",
  selectable = true,
  editable = false,
}: WorkOrderCalendarProps) => {
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return workOrders.map((workOrder) => {
      const typeColor = getMaintenanceTypeColor(workOrder.type);
      let startDate: string;
      let endDate: string | undefined;
      let isAllDay = false;

      if (workOrder.scheduledStartDateTime && workOrder.scheduledEndDateTime) {
        startDate = workOrder.scheduledStartDateTime;
        endDate = workOrder.scheduledEndDateTime;
        isAllDay = false;
      } else if (workOrder.actualStartDateTime && workOrder.actualEndDateTime) {
        startDate = workOrder.actualStartDateTime;
        endDate = workOrder.actualEndDateTime;
        isAllDay = false;
      } else if (workOrder.scheduledDate) {
        startDate = workOrder.scheduledDate;
        endDate = workOrder.completedDate || workOrder.scheduledDate;
        isAllDay = true;
      } else {
        startDate = new Date().toISOString().split('T')[0];
        endDate = startDate;
        isAllDay = true;
      }

      return {
        id: workOrder.id,
        title: workOrder.jobTitle,
        start: startDate,
        end: endDate,
        allDay: isAllDay,
        backgroundColor: typeColor.bg,
        borderColor: "transparent",
        textColor: typeColor.text,
        extendedProps: {
          workOrder,
          status: workOrder.status,
          type: workOrder.type,
          progress: workOrder.progress,
          assetName: workOrder.assetName,
          workOrderId: workOrder.id,
        },
      };
    });
  }, [workOrders]);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const workOrder = clickInfo.event.extendedProps.workOrder as WorkOrder;
    if (onEventClick) {
      onEventClick(workOrder);
    }
  }, [onEventClick]);

  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const { workOrderId, assetName, status, progress } = eventInfo.event.extendedProps;
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
              {workOrderId} • {assetName}
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

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (onDateSelect) {
      onDateSelect(selectInfo);
    }
  }, [onDateSelect]);

  // const handleEventChange = useCallback((changeInfo: EventChangeArg) => {
  //   const workOrder = changeInfo.event.extendedProps.workOrder as WorkOrder;
  //   const newStart = changeInfo.event.start;
  //   const newEnd = changeInfo.event.end;
  //   if (onEventChange && newStart) {
  //     onEventChange(workOrder, newStart, newEnd);
  //   }
  // }, [onEventChange]);

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
        // onEventChange={handleEventChange}
        eventContent={renderEventContent}
        nowIndicator={true}
        selectMirror={true}
        height="auto"
      />
    </div>
  );
};

export default WorkOrderCalendar;
