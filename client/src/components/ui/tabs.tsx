import { Link, useLocation } from "react-router";
import cn from "../../utils/cn";

interface Item {
  href: string;
  label: string;
}

interface TabsProps extends React.ComponentProps<"ul"> {
  items: Item[];
}

export default function Tabs({ className, items, ...props }: TabsProps) {
  const { pathname } = useLocation();

  return (
    <ul
      {...props}
      className={cn(
        "inline-flex space-x-4 rounded-md bg-gray-100 p-1 dark:bg-gray-800",
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          className={cn(
            "rounded-md px-4",
            pathname.startsWith(item.href)
              ? "bg-surface shadow"
              : "text-gray-500",
          )}
          key={index}
        >
          <Link className="text-sm font-medium" to={item.href}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
