import { useState, useMemo } from "react";
import { Card, Button } from "@/components/ui/components";
import { Badge } from "@/components/ui/components";
import type { WorkOrders, WorkOrder } from "../types";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "schedule" | "workOrder";
  priority: string;
  status: string;
  data: WorkOrders | WorkOrder;
}

interface MaintenanceCalendarProps {
  schedules: WorkOrders[];
  workOrders: WorkOrder[];
  onEventClick?: (event: CalendarEvent) => void;
}

export const MaintenanceCalendar = ({
  schedules,
  workOrders,
  onEventClick,
}: MaintenanceCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Combine schedules and work orders into calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    schedules.forEach((schedule) => {
      events.push({
        id: schedule.id,
        title: schedule.taskDescription,
        date: new Date(schedule.scheduledDate),
        type: "schedule",
        priority: schedule.priority,
        status: schedule.status,
        data: schedule,
      });
    });

    workOrders.forEach((workOrder) => {
      events.push({
        id: workOrder.id,
        title: workOrder.jobTitle,
        date: new Date(workOrder.scheduledDate),
        type: "workOrder",
        priority: workOrder.priority,
        status: workOrder.status,
        data: workOrder,
      });
    });

    return events;
  }, [schedules, workOrders]);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const startingDayOfWeek = firstDay.getDay();
    const prevMonthDays = startingDayOfWeek;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      events: CalendarEvent[];
    }> = [];

    // Previous month days
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        events: calendarEvents.filter(
          (event) => event.date.toDateString() === date.toDateString()
        ),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        events: calendarEvents.filter(
          (event) => event.date.toDateString() === date.toDateString()
        ),
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        events: calendarEvents.filter(
          (event) => event.date.toDateString() === date.toDateString()
        ),
      });
    }

    return days;
  }, [currentDate, calendarEvents]);

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Low: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      Medium:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
      High: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
      Critical: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    };
    return colors[priority] || "bg-grey-100 text-grey-700";
  };

  return (
    <Card className="border border-outline bg-surfaceContainer p-4">
      {/* Calendar Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="title-medium font-semibold text-onSurface">
          {monthYear}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            ← Prev
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            Next →
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="body-small p-2 text-center font-semibold text-onSurfaceVariant"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`min-h-24 border border-outline bg-surface p-2 ${
                !day.isCurrentMonth ? "opacity-50" : ""
              } ${isToday ? "ring-2 ring-primary" : ""}`}
            >
              <div
                className={`body-small mb-1 font-medium ${
                  isToday ? "text-primary" : "text-onSurface"
                }`}
              >
                {day.date.getDate()}
              </div>

              {/* Events for this day */}
              <div className="flex flex-col gap-1">
                {day.events.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick?.(event)}
                    className={`body-small truncate rounded px-1 py-0.5 text-left ${getPriorityColor(
                      event.priority
                    )}`}
                    title={event.title}
                  >
                    {event.title}
                  </button>
                ))}
                {day.events.length > 3 && (
                  <div className="body-small text-onSurfaceVariant">
                    +{day.events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge text="Schedule" variant="blue" className="h-6 px-2" />
          <span className="body-small text-onSurfaceVariant">
            Maintenance Schedule
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge text="Work Order" variant="green" className="h-6 px-2" />
          <span className="body-small text-onSurfaceVariant">Work Order</span>
        </div>
      </div>
    </Card>
  );
};

export default MaintenanceCalendar;
