import { CalendarEvent, CalendarView } from "./types";
import { getDictionary } from "../../../dictionaries";
import { useCallback, useMemo, useState } from "react";
import CalendarHeader from "./calendar-header";
import cn from "../../../utils/cn";
import DayView from "./day-view";
import MonthView from "./month-view";
import WeekView from "./week-view";

export interface CalendarProps {
  className?: string;
  events?: CalendarEvent[];
  initialDate?: Date;
  initialView?: CalendarView;
  maxDate?: Date;
  minDate?: Date;
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onViewChange?: (view: CalendarView) => void;
  viewOptions?: CalendarView[];
}

export default function Calendar({
  className = "",
  events = [],
  initialDate = new Date(),
  initialView = "month",
  maxDate,
  minDate,
  onDateClick,
  onEventClick,
  onViewChange,
  viewOptions = ["month", "week", "day"],
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [view, setView] = useState<CalendarView>(initialView);

  const dict = getDictionary();

  const handlePrevious = useCallback(() => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() - 1);
      }
      return newDate;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === "month") {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (view === "week") {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  }, [view]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleViewChange = useCallback(
    (newView: CalendarView) => {
      setView(newView);
      onViewChange?.(newView);
    },
    [onViewChange],
  );

  const viewComponent = useMemo(() => {
    const viewProps = {
      currentDate,
      dict,
      events,
      maxDate,
      minDate,
      onDateClick,
      onEventClick,
    };

    switch (view) {
      case "month":
        return <MonthView {...viewProps} />;
      case "week":
        return <WeekView {...viewProps} />;
      case "day":
        return <DayView {...viewProps} />;
      default:
        return <MonthView {...viewProps} />;
    }
  }, [
    currentDate,
    dict,
    events,
    maxDate,
    minDate,
    onDateClick,
    onEventClick,
    view,
  ]);

  return (
    <div
      className={cn(
        "border-secondary-200 dark:border-secondary-700 bg-surface flex flex-col overflow-hidden border",
        className,
      )}
    >
      <CalendarHeader
        currentDate={currentDate}
        dict={dict}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onToday={handleToday}
        onViewChange={handleViewChange}
        view={view}
        viewOptions={viewOptions}
      />
      <div className="flex-1">{viewComponent}</div>
    </div>
  );
}
