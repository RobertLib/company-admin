import { isValidElement, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import cn from "../../utils/cn";
import IconButton from "./icon-button";

interface Item {
  href?: string;
  label: string;
  onClick?: () => void;
}

interface DropdownProps extends React.ComponentProps<"div"> {
  items: (Item | React.ReactNode)[];
  trigger: React.ReactNode;
}

export default function Dropdown({
  className,
  items,
  trigger,
  ...props
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = ({ target }: MouseEvent) => {
      if (!dropdownRef.current?.contains(target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const itemStyles =
    "block w-full text-sm text-left px-4 py-1.25 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition-colors";

  return (
    <div
      {...props}
      className={cn("relative inline-flex", className)}
      ref={dropdownRef}
    >
      <IconButton
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={typeof trigger === "string" ? trigger : "Open menu"}
        onClick={toggleDropdown}
      >
        {trigger}
      </IconButton>
      {isOpen && (
        <ul
          aria-orientation="vertical"
          className="animate-fade-in absolute right-0 mt-7.5 max-h-60 min-w-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-black"
          role="menu"
          tabIndex={-1}
        >
          {items
            .filter((item) => item !== null)
            .map((item, index) => (
              <li className="m-1" key={index} role="menuitem">
                {isValidElement(item) ? (
                  item
                ) : typeof item === "object" && "label" in item ? (
                  item.href ? (
                    <Link className={itemStyles} to={item.href}>
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className={itemStyles}
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      type="button"
                    >
                      {item.label}
                    </button>
                  )
                ) : null}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
