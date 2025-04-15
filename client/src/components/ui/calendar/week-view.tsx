import { CalendarViewProps } from "./types";
import { formatTime, isSameDay, locales } from "../../../utils/date-utils";
import { getColorStyles } from "./utils";
import { useMemo } from "react";
import cn from "../../../utils/cn";

export default function WeekView({
  currentDate,
  dict,
  events,
  maxDate,
  minDate,
  onDateClick,
  onEventClick,
}: CalendarViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const weekDays = useMemo(() => {
    const days = [];

    const firstDayOfWeek = new Date(currentDate);
    const day = firstDayOfWeek.getDay();
    firstDayOfWeek.setDate(
      firstDayOfWeek.getDate() - (day === 0 ? 6 : day - 1),
    );

    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(date.getDate() + i);

      const isDisabled =
        (minDate && date < minDate) || (maxDate && date > maxDate);

      days.push({
        date,
        disabled: isDisabled,
        events: events.filter((event) => {
          const eventDate = new Date(event.start);
          return isSameDay(eventDate, date);
        }),
        isToday: isSameDay(date, new Date()),
      });
    }

    return days;
  }, [currentDate, events, maxDate, minDate]);

  return (
    <div className="week-view h-[600px] overflow-auto">
      <div className="bg-surface sticky top-0 z-10 grid grid-cols-[60px_1fr]">
        <div className="border-r border-neutral-200" />
        <div className="grid grid-cols-7">
          {weekDays.map((day, index) => {
            const date = day.date.getDate();
            const month = day.date.toLocaleString(locales, { month: "short" });

            return (
              <div
                className={cn(
                  "border-r border-neutral-200 p-2 text-center",
                  day.isToday && "bg-primary-50 dark:bg-primary-900/30",
                  day.disabled
                    ? "opacity-60"
                    : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                )}
                key={index}
                onClick={() => !day.disabled && onDateClick?.(day.date)}
              >
                <div className="font-medium">
                  {dict.calendar.weekDays[index]}
                </div>
                <div
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full",
                    day.isToday && "bg-primary-500 text-white",
                  )}
                >
                  {date}
                </div>
                <div className="text-xs text-gray-500">{month}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[60px_1fr]">
        <div className="time-column">
          {hours.map((hour) => (
            <div
              className="relative h-16 border-r border-b border-neutral-200 text-xs text-gray-500"
              key={hour}
            >
              <span className="absolute -top-2 right-2">
                {formatTime(hour)}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {weekDays.map((day, dayIndex) => (
            <div className="day-column relative" key={dayIndex}>
              {hours.map((hour) => (
                <div
                  className="h-16 border-r border-b border-neutral-200"
                  key={hour}
                />
              ))}

              {day.events
                .filter((event) => !event.allDay)
                .map((event) => {
                  const startHour = event.start.getHours();
                  const startMinute = event.start.getMinutes();
                  const endHour = event.end.getHours();
                  const endMinute = event.end.getMinutes();

                  const top = startHour * 64 + (startMinute / 60) * 64;
                  const height =
                    (endHour - startHour) * 64 +
                    ((endMinute - startMinute) / 60) * 64;

                  return (
                    <div
                      className={cn(
                        "absolute right-1 left-1 cursor-pointer overflow-hidden rounded-md border-l-2 px-2 py-1 text-xs",
                        ...getColorStyles(event.color),
                      )}
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                      style={{ height: `${height}px`, top: `${top}px` }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs opacity-80">
                        {`${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`}
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
