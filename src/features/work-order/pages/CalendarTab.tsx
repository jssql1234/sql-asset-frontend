import WorkOrderCalendar from "../components/WorkOrderCalendar";
import type { WorkOrder } from "../types";
import { Card } from "@/components/ui/components";

interface CalendarTabProps {
  workOrders: WorkOrder[];
  onEventClick?: (workOrder: WorkOrder) => void;
  onDateSelect?: (selectInfo: any) => void;
  onEventChange?: (workOrder: WorkOrder, newStart: Date, newEnd: Date | null) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  workOrders,
  onEventClick,
  onDateSelect,
  onEventChange,
}) => {
  return (
    <div className="flex flex-col gap-6 p-2 overflow-auto">
      <div>
        <h2 className="title-large font-semibold text-onSurface">Calendar View</h2>
        <p className="body-medium text-onSurfaceVariant">
          Visual overview of work orders and maintenance schedule. Click on events to view details, or select dates to create new work orders.
        </p>
      </div>
        <WorkOrderCalendar
          workOrders={workOrders}
          onEventClick={onEventClick}
          onDateSelect={onDateSelect}
          onEventChange={onEventChange}
          selectable={true}
          editable={true}
        />
    </div>
  );
};

export default CalendarTab;
