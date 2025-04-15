import { Link } from "react-router";

interface Item {
  href: string;
  label: string;
}

interface BreadcrumbsProps extends React.ComponentProps<"nav"> {
  items: Item[];
}

export default function Breadcrumbs({ items, ...props }: BreadcrumbsProps) {
  return (
    <nav {...props}>
      <ol className="flex">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              className="text-sm after:mx-2 after:text-gray-500 after:content-['>'] last:after:content-['']"
              key={index}
            >
              {isLast ? (
                <span className="font-semibold text-gray-500">
                  {item.label}
                </span>
              ) : (
                <Link className="link" to={item.href}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
