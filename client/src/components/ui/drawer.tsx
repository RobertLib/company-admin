import "./drawer.css";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { use, useRef, useState } from "react";
import cn from "../../utils/cn";
import DrawerContext from "../../contexts/drawer-context";
import Overlay from "./overlay";
import Popover from "./popover";
import useIsMobile from "../../hooks/use-is-mobile";
import useIsMounted from "../../hooks/use-is-mounted";

interface Item {
  href?: string;
  children?: Item[];
  icon?: React.ReactNode;
  label: string;
}

interface DrawerProps extends React.ComponentProps<"aside"> {
  items: Item[];
}

export default function Drawer({ className, items, ...props }: DrawerProps) {
  const { isCollapsed, isOpen, toggleOpen } = use(DrawerContext);

  const isMobile = useIsMobile();
  const isMounted = useIsMounted();

  return (
    <>
      {isOpen && isMobile && isMounted && (
        <Overlay
          onClick={toggleOpen}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              toggleOpen();
            }
          }}
          role="button"
          tabIndex={0}
        />
      )}
      <aside
        {...props}
        aria-hidden={!isOpen}
        aria-label="Main navigation"
        className={cn(
          "drawer fixed inset-y-0 left-0 z-40 border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-black",
          isCollapsed ? "drawer-collapsed" : "",
          isOpen
            ? "drawer-open translate-x-0"
            : "drawer-closed -translate-x-full",
          className,
        )}
        role="navigation"
      >
        <nav className="p-4">
          <ul className="space-y-2">
            {items.map((item, index) => (
              <DrawerItem item={item} key={index} isCollapsed={isCollapsed} />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

interface DrawerItemProps {
  isCollapsed?: boolean;
  item: Item;
  level?: number;
}

function DrawerItem({ isCollapsed, item, level = 0 }: DrawerItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  const itemRef = useRef<HTMLLIElement>(null);

  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = () => {
    if (hasChildren && !isCollapsed) {
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <li
      className="relative"
      onMouseEnter={() => isCollapsed && setShowPopover(true)}
      onMouseLeave={() => isCollapsed && setShowPopover(false)}
      ref={itemRef}
    >
      {item.href && !hasChildren ? (
        <Link
          className={cn(
            "flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
            level > 0 && "pl-7",
            isCollapsed && level === 0 && "justify-center",
          )}
          to={item.href}
        >
          {item.icon && (
            <span className={cn(!(isCollapsed && level === 0) && "mr-3")}>
              {item.icon}
            </span>
          )}
          {(!isCollapsed || level > 0) && item.label}
        </Link>
      ) : (
        <button
          aria-expanded={isExpanded}
          aria-haspopup="true"
          className={cn(
            "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
            level > 0 && "pl-7",
            isCollapsed && level === 0 && "justify-center",
          )}
          onClick={handleToggle}
          role="menuitem"
          type="button"
        >
          <span className="flex items-center">
            {item.icon && (
              <span className={cn(!(isCollapsed && level === 0) && "mr-3")}>
                {item.icon}
              </span>
            )}
            {(!isCollapsed || level > 0) && item.label}
          </span>
          {hasChildren && !isCollapsed && (
            <span className="ml-auto">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
        </button>
      )}

      {hasChildren && isExpanded && !isCollapsed && (
        <ul className="mt-1 space-y-1">
          {item.children?.map((child, index) => (
            <DrawerItem
              isCollapsed={isCollapsed}
              item={child}
              key={index}
              level={level + 1}
            />
          ))}
        </ul>
      )}

      {isCollapsed && hasChildren && level === 0 && (
        <Popover
          content={
            <>
              <div className="px-3 py-1 font-medium">{item.label}</div>
              <ul className="mt-1 space-y-1">
                {item.children?.map((child, index) => (
                  <DrawerItem
                    isCollapsed={false}
                    item={child}
                    key={index}
                    level={1}
                  />
                ))}
              </ul>
            </>
          }
          onOpenChange={setShowPopover}
          open={showPopover}
          position="right"
          trigger="hover"
        />
      )}
    </li>
  );
}
