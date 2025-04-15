import { ChevronLeft, ChevronRight, ChevronsLeft } from "lucide-react";
import Button from "./button";
import cn from "../../utils/cn";

interface PaginationProps extends Omit<React.ComponentProps<"ul">, "onChange"> {
  limit?: number;
  onChange: (page: number) => void;
  page: number;
  total?: number;
}

export default function Pagination({
  className,
  limit,
  onChange,
  page,
  total,
  ...props
}: PaginationProps) {
  return (
    <nav aria-label="Pagination">
      <ul {...props} className={cn("flex items-center gap-1.5", className)}>
        <li className="mr-1.25 flex items-center">
          <span aria-live="polite">
            {page} /{" "}
            {typeof total === "undefined" || typeof limit === "undefined"
              ? 1
              : Math.ceil(total / limit) || 1}
          </span>
        </li>
        <li className="flex items-center">
          <Button
            aria-label="Go to first page"
            disabled={page <= 1}
            onClick={() => onChange(1)}
            size="sm"
            variant="default"
          >
            <ChevronsLeft size={18} />
          </Button>
        </li>
        <li className="flex items-center">
          <Button
            aria-label="Go to previous page"
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
            size="sm"
            variant="default"
          >
            <ChevronLeft size={18} />
          </Button>
        </li>
        <li className="flex items-center">
          <Button
            aria-label="Go to next page"
            disabled={
              typeof limit === "undefined" || typeof total === "undefined"
                ? true
                : page * limit >= total
            }
            onClick={() => onChange(page + 1)}
            size="sm"
            variant="default"
          >
            <ChevronRight size={18} />
          </Button>
        </li>
      </ul>
    </nav>
  );
}
