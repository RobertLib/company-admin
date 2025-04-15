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
    <ul {...props} className={cn("flex gap-1.5", className)}>
      <li>
        {page} /{" "}
        {typeof total === "undefined" || typeof limit === "undefined"
          ? 1
          : Math.ceil(total / limit) || 1}
      </li>
      <li>
        <Button
          disabled={page <= 1}
          onClick={() => onChange(1)}
          size="sm"
          variant="default"
        >
          &lt;&lt;
        </Button>
      </li>
      <li>
        <Button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          size="sm"
          variant="default"
        >
          &lt;
        </Button>
      </li>
      <li>
        <Button
          disabled={
            typeof limit === "undefined" || typeof total === "undefined"
              ? true
              : page * limit >= total
          }
          onClick={() => onChange(page + 1)}
          size="sm"
          variant="default"
        >
          &gt;
        </Button>
      </li>
    </ul>
  );
}
