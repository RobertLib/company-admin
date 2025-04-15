import { Fragment } from "react";
import cn from "../../utils/cn";

interface Item {
  term: string;
  description: string | null;
}

interface DescriptionListProps extends React.ComponentProps<"dl"> {
  items: Item[];
}

export default function DescriptionList({
  className,
  items,
  ...props
}: DescriptionListProps) {
  return (
    <dl {...props} className={cn("grid grid-cols-1 gap-y-3", className)}>
      {items.map((item, index) => (
        <Fragment key={index}>
          <dt className="text-sm font-semibold">{item.term}</dt>
          <dd className="text-gray-500">{item.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
