/**
 * Generic FullCalendar Component
 * 
 * A reusable calendar component built with FullCalendar library.
 * This component provides a fully-featured calendar with month, week, day, and list views.
 * 
 * @see https://fullcalendar.io/docs/react
 */

import { useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import type { 
  EventApi, 
  DateSelectArg, 
  EventClickArg,
  EventContentArg,
  DatesSetArg,
  EventChangeArg,
  EventInput
} from "@fullcalendar/core";

export interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: Record<string, any>;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  initialView?: string; /* 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek' */
  initialDate?: string | Date;
  selectable?: boolean;
  editable?: boolean;
  weekends?: boolean;
  dayMaxEvents?: boolean | number;
  headerToolbar?: {
    left?: string;
    center?: string;
    right?: string;
  };
  onDateSelect?: (selectInfo: DateSelectArg) => void;
  onEventClick?: (clickInfo: EventClickArg) => void;              /** Callback when event is clicked */
  onDatesSet?: (dateInfo: DatesSetArg) => void;                   /** Callback when visible date range changes */
  onEventsSet?: (events: EventApi[]) => void;                     /** Callback when events are set/updated */
  onEventChange?: (changeInfo: EventChangeArg) => void;           /** Callback when event is changed (drag/resize) */
  eventContent?: (eventInfo: EventContentArg) => React.ReactNode; /** Custom event content renderer */
  className?: string;
  height?: string | number;
  nowIndicator?: boolean; /** Enable now indicator (current time line) */
  selectMirror?: boolean; /** Select mirror (show selection while dragging) */
}

/* ---------------------------------
//
// ----------- Component ----------
//
// -------------------------------- */

export const Calendar = ({
  events = [],
  initialView = "dayGridMonth",
  initialDate,
  selectable = false,
  editable = false,
  weekends = true,
  dayMaxEvents = true,
  headerToolbar = {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
  },
  onDateSelect,
  onEventClick,
  onDatesSet,
  onEventsSet,
  onEventChange,
  eventContent,
  className = "",
  height = "auto",
  nowIndicator = true,
  selectMirror = true,
}: CalendarProps) => {
  const calendarRef = useRef<FullCalendar>(null);

  // Handle date selection
  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      if (onDateSelect) {
        onDateSelect(selectInfo);
      }
    },
    [onDateSelect]
  );

  // Handle event click
  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      if (onEventClick) {
        onEventClick(clickInfo);
      }
    },
    [onEventClick]
  );

  // Handle dates set (view change)
  const handleDatesSet = useCallback(
    (dateInfo: DatesSetArg) => {
      if (onDatesSet) {
        onDatesSet(dateInfo);
      }
    },
    [onDatesSet]
  );

  // Handle events set
  const handleEventsSet = useCallback(
    (events: EventApi[]) => {
      if (onEventsSet) {
        onEventsSet(events);
      }
    },
    [onEventsSet]
  );

  // Handle event change (drag/resize)
  const handleEventChange = useCallback(
    (changeInfo: EventChangeArg) => {
      if (onEventChange) {
        onEventChange(changeInfo);
      }
    },
    [onEventChange]
  );

  return (
    <div className={`calendar-wrapper ${className}`}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={headerToolbar}
        initialView={initialView}
        initialDate={initialDate}
        editable={editable}
        selectable={selectable}
        selectMirror={selectMirror}
        dayMaxEvents={dayMaxEvents}
        weekends={weekends}
        nowIndicator={nowIndicator}
        events={events}
        select={handleDateSelect}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        eventsSet={handleEventsSet}
        eventChange={handleEventChange}
        eventContent={eventContent}
        height={height}
        // Styling
        themeSystem="standard"
        // Navigation
        navLinks={true}
        // Event interactions
        eventDurationEditable={editable}
        eventResizableFromStart={editable}
        // Display
        displayEventTime={true}
        displayEventEnd={false}
        // Week settings
        firstDay={1} // Monday
        weekNumbers={false}
      />
    </div>
  );
};

/**
 * Get Calendar API
 * 
 * Utility hook to access the calendar API for programmatic control
 * 
 * @example
 * ```tsx
 * const calendarRef = useRef<FullCalendar>(null);
 * 
 * const goToToday = () => {
 *   const calendarApi = calendarRef.current?.getApi();
 *   calendarApi?.today();
 * };
 * ```
 */
export const useCalendarApi = (calendarRef: React.RefObject<FullCalendar>) => {
  return useCallback(() => {
    return calendarRef.current?.getApi();
  }, [calendarRef]);
};

export default Calendar;
