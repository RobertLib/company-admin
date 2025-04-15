import { CalendarViewProps } from "./types";
import { isSameDay, isToday } from "../../../utils/date-utils";
import { useMemo } from "react";
import DateCell from "./date-cell";

export default function MonthView({
  currentDate,
  dict,
  events,
  maxDate,
  minDate,
  onDateClick,
  onEventClick,
}: CalendarViewProps) {
  const weeks = useMemo(() => {
    const result = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay() || 7;
    startDate.setDate(startDate.getDate() - (dayOfWeek - 1));

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const currentDate = new Date(startDate);

        const isCurrentMonth =
          currentDate.getMonth() === month &&
          currentDate.getFullYear() === year;

        const isDisabled =
          (minDate && currentDate < minDate) ||
          (maxDate && currentDate > maxDate);

        const dayEvents = events.filter(
          (event) =>
            isSameDay(event.start, currentDate) ||
            (event.allDay &&
              event.start <= currentDate &&
              event.end >= currentDate),
        );

        week.push({
          date: new Date(currentDate),
          disabled: isDisabled,
          events: dayEvents,
          isCurrentMonth,
          isToday: isToday(currentDate),
        });

        startDate.setDate(startDate.getDate() + 1);
      }
      result.push(week);
    }

    return result;
  }, [currentDate, events, maxDate, minDate]);

  return (
    <div className="h-full">
      <div className="grid grid-cols-7 border-b border-neutral-200">
        {dict.calendar.weekDays.map((day, index) => (
          <div
            className="p-2 text-center font-medium text-gray-500 dark:text-gray-400"
            key={index}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid h-full grid-rows-6">
        {weeks.map((week, i) => (
          <div className="grid grid-cols-7 border-b border-neutral-200" key={i}>
            {week.map((day, j) => (
              <DateCell
                date={day.date}
                dict={dict}
                disabled={day.disabled}
                events={day.events}
                isCurrentMonth={day.isCurrentMonth}
                isToday={day.isToday}
                key={`${i}-${j}`}
                onDateClick={onDateClick}
                onEventClick={onEventClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
