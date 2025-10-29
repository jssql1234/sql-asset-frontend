import WorkOrderCalendar from "../components/WorkOrderCalendar";
import ErrorBoundary from "@/components/errors/ErrorBoundary";
import ErrorFallback from "@/components/errors/ErrorFallback";
import { logError } from "@/utils/logger";
import type { DateSelectArg } from "@fullcalendar/core";
import type { WorkOrder } from "../types";

interface CalendarTabProps {
  workOrders: WorkOrder[];
  onEventClick?: (workOrder: WorkOrder) => void;
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventChange?: (workOrder: WorkOrder, newStart: Date, newEnd: Date | null) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  workOrders,
  onEventClick,
  onDateSelect,
  onEventChange,
}) => {
  const legendItems = [
    { label: "Normal", color: "#2196f3", textColor: "#ffffff" },
    { label: "Critical", color: "#ffc107", textColor: "#000000" },
    { label: "Emergency", color: "#f44336", textColor: "#ffffff" },
  ];

  return (
    <div className="flex flex-col gap-6 p-2 overflow-auto">
      {/* <div>
        <h2 className="title-large font-semibold text-onSurface">Calendar View</h2>
        <p className="body-medium text-onSurfaceVariant">
          Visual overview of work orders and maintenance schedule. Click on events to view details, or select dates to create new work orders.
        </p>
      </div> */}

      {/* Color Legend */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-surfaceContainer rounded-lg border border-outline">
        <span className="text-sm font-medium text-onSurface">Priority Legend:</span>
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded border border-outline/50"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-onSurfaceVariant">{item.label}</span>
          </div>
        ))}
      </div>

        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error, info) => {
            logError(error, info, {
              scope: "widget",
              route: "/work-order/calendar",
              component: "WorkOrderCalendar",
            });
          }}
        >
        <WorkOrderCalendar
            workOrders={workOrders}
            onEventClick={onEventClick}
            onDateSelect={onDateSelect}
            onEventChange={onEventChange}
            selectable={true}
            editable={false}
          />
        </ErrorBoundary>
    </div>
  );
};

export default CalendarTab;
