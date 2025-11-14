import { type ReactElement, useMemo, useState } from "react";
import { Button, Card } from "@/components/ui/components";
import { ChevronLeft, ChevronRight } from "@/assets/icons";
import { parseDateLike } from "../utils/formatters";
import type { AllocationCalendarEvent, AllocationCalendarEventType } from "../types";

export type CalendarViewMode = "month" | "week" | "day";

interface CalendarViewProps {
  viewMode: CalendarViewMode;
  searchTerm: string;
  assetFilter: string;
  events: AllocationCalendarEvent[];
}

interface CalendarEventWithDates extends AllocationCalendarEvent {
  startDate: Date;
  endDate?: Date;
}

function CalendarView({
  viewMode,
  searchTerm,
  assetFilter,
  events,
}: CalendarViewProps): ReactElement {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const eventsWithDates = useMemo<CalendarEventWithDates[]>(() => {
    return events.reduce<CalendarEventWithDates[]>((accumulator, event) => {
      const startDate = parseDateLike(event.start);
      if (!startDate) {
        return accumulator;
      }

      const endDate = parseDateLike(event.end);

      accumulator.push({
        ...event,
        startDate,
        endDate: endDate ?? undefined,
      });

      return accumulator;
    }, []);
  }, [events]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedFilter = assetFilter.trim().toLowerCase();

  const filteredEvents = useMemo(() => {
    return eventsWithDates.filter((event) => {
      const searchTarget = `${event.assetName} ${event.title} ${event.assignee ?? ""} ${event.location ?? ""}`.toLowerCase();
      const matchesSearch = normalizedSearch
        ? searchTarget.includes(normalizedSearch)
        : true;
      const matchesAssetFilter = normalizedFilter
        ? event.assetName.toLowerCase().includes(normalizedFilter)
        : true;
      return matchesSearch && matchesAssetFilter;
    });
  }, [eventsWithDates, normalizedFilter, normalizedSearch]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getEventTypeStyle = (type: AllocationCalendarEventType) => {
    switch (type) {
      case "user-assignment":
        return "bg-primary text-onPrimary";
      case "location-allocation":
        return "bg-warning text-onWarning";
      case "overdue":
        return "bg-error text-onError";
      case "maintenance":
        return "bg-success text-onSuccess";
      default:
        return "bg-outline text-onOutline";
    }
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i.toString()}`} className="p-2 h-32"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = filteredEvents.filter((event) => {
        const eventStart = event.startDate;
        const eventEnd = event.endDate ?? eventStart;
        return dayDate >= eventStart && dayDate <= eventEnd;
      });

      days.push(
        <div key={day} className="p-2 h-32 border border-outline bg-surface">
          <div className="font-medium text-onSurface label-medium mb-2">
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate ${getEventTypeStyle(
                  event.type
                )}`}
                title={event.title}
              >
                {event.assetName}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <div
            key={dayName}
            className="p-3 font-medium text-center bg-surfaceContainer border border-outline label-medium text-onSurface"
          >
            {dayName}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    return (
      <div className="p-6 text-center">
        <div className="title-medium text-onSurface mb-4">Week View</div>
        <p className="body-medium text-onSurfaceVariant">
          Week view will be implemented with detailed daily schedules and hourly
          time slots.
        </p>
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="p-6 text-center">
        <div className="title-medium text-onSurface mb-4">Day View</div>
        <p className="body-medium text-onSurfaceVariant">
          Day view will show hourly schedule with detailed asset assignment
          information.
        </p>
      </div>
    );
  };

  return (
    <Card className="mt-0 h-full overflow-hidden px-0 py-0">
      {/* Calendar Header */}
      <div className="flex flex-col gap-4 border-b border-outline px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <h3 className="title-medium text-onSurface">
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <Button variant="secondary" onClick={() => { setCurrentDate(new Date()); }}>
          Today
        </Button>
      </div>

      {/* Calendar Body */}
      <div className="min-h-96">
        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </div>
    </Card>
  );
}

export default CalendarView;
