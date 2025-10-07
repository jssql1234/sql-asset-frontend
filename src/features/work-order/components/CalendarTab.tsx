import MaintenanceCalendar from "./WokrOrderCalendar";
import type { WorkOrders, WorkOrder } from "../types";

interface CalendarTabProps {
  schedules: WorkOrders[];
  workOrders: WorkOrder[];
  onEventClick?: (event: any) => void;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({
  schedules,
  workOrders,
  onEventClick,
}) => {
  return (
    <div className="flex flex-col gap-6 p-2 overflow-auto">
      <div>
        <h2 className="title-large font-semibold text-onSurface">Calendar View</h2>
        <p className="body-medium text-onSurfaceVariant">
          Visual overview of scheduled maintenance and work orders
        </p>
      </div>

      <MaintenanceCalendar
        schedules={schedules}
        workOrders={workOrders}
        onEventClick={onEventClick}
      />
    </div>
  );
};

export default CalendarTab;
