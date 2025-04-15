import { useEffect, useRef, useState } from "react";
import cn from "../../utils/cn";
import Chip from "./chip";
import logger from "../../utils/logger";
import Spinner from "./spinner";

interface Option<T = string | number> {
  label: string;
  value: T;
}

interface AutocompleteProps extends React.ComponentProps<"div"> {
  loadMore?: () => Promise<void>;
  multi?: boolean;
  name?: string;
  options: Option[];
  placeholder?: string;
}

export default function Autocomplete({
  className,
  loadMore,
  multi = false,
  name,
  options,
  placeholder,
  ...props
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const filteredOptions = options.filter((options) =>
    options.label.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = ({ target }: MouseEvent) => {
      if (!containerRef.current?.contains(target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = async () => {
    if (!dropdownRef.current || !loadMore || loading) return;

    const { scrollTop, scrollHeight, clientHeight } = dropdownRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      try {
        setLoading(true);
        await loadMore();
      } catch (error) {
        logger.error("Error loading more options:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelect = (option: Option) => {
    if (multi) {
      if (selectedOptions.find((o) => o.value === option.value)) return;
      setSelectedOptions([...selectedOptions, option]);
    } else {
      setSelectedOptions([option]);
      setSearch(option.label);
      setOpen(false);
    }
  };

  const handleRemove = (option: Option) => {
    setSelectedOptions(selectedOptions.filter((o) => o.value !== option.value));
  };

  return (
    <div {...props} className={cn("relative", className)} ref={containerRef}>
      {name &&
        (multi
          ? selectedOptions.map((option) => (
              <input
                key={option.value}
                name={name}
                type="hidden"
                value={option.value}
              />
            ))
          : selectedOptions[0] && (
              <input
                name={name}
                type="hidden"
                value={selectedOptions[0].value}
              />
            ))}
      {multi ? (
        <div className="flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 dark:border-gray-600">
          {selectedOptions.map((option) => (
            <Chip
              className="cursor-pointer"
              key={option.value}
              onClick={() => handleRemove(option)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleRemove(option);
              }}
              role="button"
              tabIndex={0}
            >
              {option.label} &times;
            </Chip>
          ))}
          <input
            className="flex-grow"
            onFocus={() => setOpen(true)}
            onChange={({ target }) => {
              setSearch(target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            type="text"
            value={search}
          />
        </div>
      ) : (
        <div className="relative flex items-center rounded-md border border-gray-300 px-2 py-1 dark:border-gray-600">
          <input
            className="flex-grow"
            onFocus={() => setOpen(true)}
            onChange={({ target }) => {
              if (
                selectedOptions[0] &&
                target.value !== selectedOptions[0].label
              ) {
                setSelectedOptions([]);
              }
              setSearch(target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            type="text"
            value={selectedOptions[0] ? selectedOptions[0].label : search}
          />
          {selectedOptions[0] && (
            <button
              aria-label="Clear"
              className="ml-2 p-1 focus:outline-none"
              onClick={() => {
                setSelectedOptions([]);
                setSearch("");
                setOpen(true);
              }}
              type="button"
            >
              &times;
            </button>
          )}
        </div>
      )}
      {open && (
        <ul
          className="absolute z-1 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-md dark:border-gray-700"
          onScroll={handleScroll}
          ref={dropdownRef}
        >
          {filteredOptions.length === 0 && (
            <li className="px-2 py-1 text-sm text-gray-500">No results</li>
          )}
          {filteredOptions.map((option) => (
            <li
              className={cn(
                "cursor-pointer px-2 py-1 hover:bg-gray-100",
                selectedOptions.find((o) => o.value === option.value) &&
                  "bg-gray-100",
              )}
              key={option.value}
              onClick={() => handleSelect(option)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSelect(option);
              }}
              role="button"
              tabIndex={0}
            >
              {option.label}
            </li>
          ))}
          {loading && (
            <li className="py-2">
              <Spinner />
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
