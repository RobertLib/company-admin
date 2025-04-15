import { Fragment } from "react";
import cn from "../../utils/cn";

interface Item {
  term: string;
  description: string | null | undefined;
}

interface DescriptionListProps extends React.ComponentProps<"dl"> {
  items: Item[];
}

const placeholderWidths = ["w-34", "w-30", "w-26", "w-38", "w-42", "w-46"];

const getPlaceholderWidth = (index: number): string =>
  placeholderWidths[index % placeholderWidths.length];

export default function DescriptionList({
  className,
  items,
  ...props
}: DescriptionListProps) {
  return (
    <dl {...props} className={cn("grid grid-cols-1 gap-y-3", className)}>
      {items.map((item, index) => (
        <Fragment key={index}>
          <dt className="text-sm font-semibold">{item.term}:</dt>
          <dd className="text-gray-500 dark:text-gray-400">
            {item.description ?? (
              <div
                className={`h-4 ${getPlaceholderWidth(index)} animate-pulse rounded bg-gray-200 dark:bg-gray-700`}
              />
            )}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}
