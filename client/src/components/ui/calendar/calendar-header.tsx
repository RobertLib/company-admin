import { Button } from "../";
import { CalendarView } from "./types";
import {
  formatDate,
  formatMonth,
  formatWeekRange,
} from "../../../utils/date-utils";
import { getDictionary } from "../../../dictionaries";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

export interface CalendarHeaderProps {
  currentDate: Date;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  onNext: () => void;
  onPrevious: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  view: CalendarView;
  viewOptions: CalendarView[];
}

export default function CalendarHeader({
  currentDate,
  dict,
  onNext,
  onPrevious,
  onToday,
  onViewChange,
  view,
  viewOptions,
}: CalendarHeaderProps) {
  const formattedDate = useMemo(() => {
    switch (view) {
      case "month":
        return formatMonth(currentDate);
      case "week":
        return formatWeekRange(currentDate);
      case "day":
        return formatDate(currentDate, "date");
      default:
        return "";
    }
  }, [currentDate, view]);

  return (
    <div className="flex items-center justify-between border-b border-neutral-200 p-2">
      <div className="flex items-center gap-2">
        <Button onClick={onToday} size="sm" variant="outline">
          {dict.calendar.today}
        </Button>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Previous"
            onClick={onPrevious}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            aria-label="Next"
            onClick={onNext}
            size="icon"
            variant="ghost"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        <h2 className="ml-2 text-lg font-semibold">{formattedDate}</h2>
      </div>
      <div className="btn-group">
        {viewOptions.map((viewOption) => (
          <Button
            key={viewOption}
            onClick={() => onViewChange(viewOption)}
            size="sm"
            variant={viewOption === view ? "default" : "outline"}
          >
            {dict.calendar[viewOption]}
          </Button>
        ))}
      </div>
    </div>
  );
}
