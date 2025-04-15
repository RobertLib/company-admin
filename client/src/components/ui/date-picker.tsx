import { Calendar } from "lucide-react";
import { formatDate, formatTime } from "../../utils/date-utils";
import { getDictionary } from "../../dictionaries";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";
import Input from "./input";
import logger from "../../utils/logger";
import Popover from "./popover";

type DatePickerType = "date" | "time" | "datetime";

interface DatePickerProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  defaultValue?: Date | string;
  dim?: "sm" | "md" | "lg";
  error?: string;
  label?: string;
  name?: string;
  onChange?: (date: Date | null) => void;
  required?: boolean;
  type?: DatePickerType;
  value?: Date | string;
}

export default function DatePicker({
  className,
  defaultValue,
  dim = "md",
  error,
  label,
  name,
  onChange,
  required,
  type = "date",
  value,
  ...props
}: DatePickerProps) {
  const [date, setDate] = useState<Date | null>(() => {
    if (value) {
      return value instanceof Date ? value : new Date(value);
    }
    if (defaultValue) {
      return defaultValue instanceof Date
        ? defaultValue
        : new Date(defaultValue);
    }
    return null;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const id = useId();
  const inputId = `datepicker-${id}`;

  const updateInputValue = useCallback(
    (date: Date) => {
      if (!date || isNaN(date.getTime())) return;

      let formattedValue = "";
      if (type === "date") {
        formattedValue = formatDate(date, "input");
      } else if (type === "time") {
        formattedValue = formatTime(date.getHours(), date.getMinutes());
      } else if (type === "datetime") {
        formattedValue = `${formatDate(date, "input")} ${formatTime(date.getHours(), date.getMinutes())}`;
      }

      setInputValue(formattedValue);
    },
    [type],
  );

  useEffect(() => {
    if (value) {
      const newDate = value instanceof Date ? value : new Date(value);
      setDate(newDate);
      updateInputValue(newDate);
    }
  }, [updateInputValue, value]);

  useEffect(() => {
    if (date) {
      updateInputValue(date);
    }
  }, [date, updateInputValue]);

  const handleDateChange = (selectedDate: Date) => {
    let newDate: Date;

    if (type === "datetime" && date) {
      newDate = new Date(selectedDate);
      newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
    } else {
      newDate = selectedDate;
    }

    setDate(newDate);
    onChange?.(newDate);

    if (type !== "datetime") {
      setIsOpen(false);
    }
  };

  const handleTimeChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = target.value;
    if (!timeValue) return;

    const [hours, minutes] = timeValue.split(":").map(Number);

    let newDate: Date;
    if (date) {
      newDate = new Date(date);
    } else {
      newDate = new Date();
      newDate.setHours(0, 0, 0, 0);
    }

    newDate.setHours(hours, minutes, 0, 0);
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleInputChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(value);

    if (value) {
      try {
        const newDate = new Date(value);
        if (!isNaN(newDate.getTime())) {
          setDate(newDate);
          onChange?.(newDate);
        }
      } catch (error) {
        logger.error("Invalid date format", error);
      }
    } else {
      setDate(null);
      onChange?.(null);
    }
  };

  const renderCalendarContent = () => {
    if (type === "time") {
      return (
        <div className="w-64 p-4">
          <input
            className="form-control w-full"
            onChange={handleTimeChange}
            type="time"
            value={inputValue}
          />
        </div>
      );
    }

    return (
      <div className="p-1">
        <CalendarPicker onDateSelect={handleDateChange} selectedDate={date} />

        {type === "datetime" && (
          <div className="border-t border-neutral-200 p-2">
            <input
              className="form-control mt-1 w-full"
              onChange={handleTimeChange}
              type="time"
              value={inputValue.split(" ")[1] || ""}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div {...props} className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium" htmlFor={inputId}>
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      <div className="relative">
        <Popover
          contentClassName="max-h-none"
          onOpenChange={setIsOpen}
          open={isOpen}
          position="bottom"
          trigger={
            <div className="relative">
              <Input
                dim={dim}
                error={error}
                id={inputId}
                name={name}
                onFocus={() => setIsOpen(true)}
                onChange={handleInputChange}
                ref={inputRef}
                required={required}
                type="text"
                value={inputValue}
              />
              <button
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setIsOpen(!isOpen)}
                type="button"
              >
                <Calendar size={18} />
              </button>
            </div>
          }
          triggerType="click"
          width="auto"
        >
          {renderCalendarContent()}
        </Popover>
      </div>

      <FormError>{error}</FormError>

      {name && (
        <input
          name={name}
          type="hidden"
          value={date ? date.toISOString() : ""}
        />
      )}
    </div>
  );
}

interface CalendarPickerProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

function CalendarPicker({ onDateSelect, selectedDate }: CalendarPickerProps) {
  const [viewDate] = useState<Date>(selectedDate ?? new Date());
  const [currentMonth, setCurrentMonth] = useState<number>(viewDate.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(
    viewDate.getFullYear(),
  );

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const dict = getDictionary();

  const previousMonth = (event: React.MouseEvent) => {
    event.stopPropagation();

    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const nextMonth = (event: React.MouseEvent) => {
    event.stopPropagation();

    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const isCurrentDate = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date: Date): boolean => {
    if (!selectedDate) return false;

    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const renderDays = () => {
    const days = [];

    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const day = lastDayOfPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, day);

      days.push(
        <button
          className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          key={`prev-${day}`}
          onClick={() => onDateSelect(date)}
          type="button"
        >
          {day}
        </button>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = isCurrentDate(date);
      const isSelected = isSelectedDate(date);

      days.push(
        <button
          className={cn(
            "h-8 w-8 rounded-full",
            isToday &&
              "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200",
            isSelected && "bg-primary-500 dark:bg-primary-600 text-white",
            !isToday &&
              !isSelected &&
              "hover:bg-gray-100 dark:hover:bg-gray-700",
          )}
          key={`current-${day}`}
          onClick={() => onDateSelect(date)}
          type="button"
        >
          {day}
        </button>,
      );
    }

    const totalCells = Math.ceil((adjustedFirstDay + daysInMonth) / 7) * 7;
    const nextMonthDays = totalCells - (adjustedFirstDay + daysInMonth);

    for (let day = 1; day <= nextMonthDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);

      days.push(
        <button
          className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          key={`next-${day}`}
          onClick={() => onDateSelect(date)}
          type="button"
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  return (
    <div className="w-64 p-2">
      <div className="mb-2 flex items-center justify-between">
        <button
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={previousMonth}
          type="button"
        >
          &lt;
        </button>
        <div className="font-medium">
          {dict.calendar.months[currentMonth]} {currentYear}
        </div>
        <button
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={nextMonth}
          type="button"
        >
          &gt;
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {dict.calendar.weekDays.map((day) => (
          <div
            className="text-center text-xs font-medium text-gray-500"
            key={day}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
}
