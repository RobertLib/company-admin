import { getDictionary } from "../../dictionaries";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import cn from "../../utils/cn";
import FormError from "./form/form-error";
import Chip from "./chip";
import logger from "../../utils/logger";
import Popover from "./popover";
import Spinner from "./spinner";

interface Option<T = string | number> {
  label: string;
  value: T;
}

interface AutocompleteProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  asSelect?: boolean;
  error?: string;
  hasEmpty?: boolean;
  label?: string;
  loadMore?: () => Promise<void>;
  multiple?: boolean;
  name?: string;
  onChange?: (value: Option["value"][] | Option["value"] | null) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  value?: Option["value"][] | Option["value"] | null;
}

export default function Autocomplete({
  asSelect = false,
  className,
  defaultValue,
  error,
  hasEmpty = false,
  label,
  loadMore,
  multiple = false,
  name,
  onChange,
  options,
  placeholder,
  required,
  value,
  ...props
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const dropdownRef = useRef<HTMLUListElement>(null);

  const id = useId();
  const inputId = `input-${id}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const listboxId = useId();

  const dict = getDictionary();

  const filteredOptions = asSelect
    ? options
    : options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase()),
      );

  const displayedOptions =
    asSelect && hasEmpty
      ? [{ label: " ", value: "" }, ...filteredOptions]
      : filteredOptions;

  useEffect(() => {
    const valueToUse = value !== undefined ? value : defaultValue;

    if (valueToUse !== undefined) {
      if (valueToUse === null || valueToUse === "") {
        setSelectedOptions([]);
        setSearch("");
        return;
      }

      const selectedValues = Array.isArray(valueToUse)
        ? valueToUse
        : [valueToUse];
      const selected = options.filter((option) =>
        selectedValues.includes(option.value),
      );

      setSelectedOptions(selected);

      if (selected.length === 1 && !multiple) {
        setSearch(selected[0].label);
      }
    }
  }, [defaultValue, multiple, options, value]);

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
    if (multiple) {
      if (selectedOptions.find((o) => o.value === option.value)) return;
      const newSelection = [...selectedOptions, option];
      setSelectedOptions(newSelection);
      onChange?.(newSelection.map((o) => o.value));
    } else {
      setSelectedOptions([option]);
      setSearch(option.label);
      setOpen(false);
      onChange?.(option.value);
    }
  };

  const handleRemove = (option: Option) => {
    const newSelection = selectedOptions.filter(
      (o) => o.value !== option.value,
    );
    setSelectedOptions(newSelection);

    if (multiple) {
      onChange?.(newSelection.map((o) => o.value));
    } else {
      onChange?.(null);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter" ||
        event.key === " "
      ) {
        event.preventDefault();
        setOpen(true);
        return;
      }
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) =>
          prev < displayedOptions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        if (activeIndex >= 0 && displayedOptions[activeIndex]) {
          event.preventDefault();
          handleSelect(displayedOptions[activeIndex]);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div {...props} className={cn("relative", className)}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium" htmlFor={inputId}>
          {label}: {required && <span className="text-danger-500">*</span>}
        </label>
      )}

      {name &&
        (multiple
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

      <Popover
        className="w-full"
        onFocus={() => !asSelect && setOpen(true)}
        onKeyDown={handleKeyDown}
        onOpenChange={setOpen}
        open={open}
        position="bottom"
        trigger={
          multiple ? (
            <div
              className={cn(
                "flex w-full items-center gap-1 rounded-md border border-neutral-300 px-2 py-1",
                error && "border-danger-500! focus:ring-danger-300!",
              )}
            >
              {selectedOptions.map((option) => (
                <Chip
                  className="cursor-pointer"
                  key={option.value}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemove(option);
                  }}
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
                aria-activedescendant={
                  activeIndex >= 0
                    ? `option-${displayedOptions[activeIndex]?.value}`
                    : undefined
                }
                aria-autocomplete="list"
                aria-controls={open ? listboxId : undefined}
                aria-describedby={error ? errorId : undefined}
                aria-expanded={open}
                aria-invalid={error ? "true" : undefined}
                aria-required={required ? "true" : undefined}
                className="flex-grow focus:outline-none"
                id={inputId}
                onClick={(event) => {
                  if (!asSelect) event.stopPropagation();
                }}
                onChange={({ target }) => {
                  setSearch(target.value);
                  setOpen(true);
                }}
                placeholder={placeholder}
                readOnly={asSelect}
                required={required}
                tabIndex={asSelect ? -1 : 0}
                type="text"
                value={search}
              />
            </div>
          ) : (
            <div
              className={cn(
                "relative flex w-full items-center rounded-md border border-neutral-300 px-2 py-1",
                error && "border-danger-500! focus:ring-danger-300!",
                asSelect && "cursor-pointer",
              )}
            >
              <input
                aria-activedescendant={
                  activeIndex >= 0
                    ? `option-${displayedOptions[activeIndex]?.value}`
                    : undefined
                }
                aria-autocomplete="list"
                aria-controls={open ? listboxId : undefined}
                aria-describedby={error ? errorId : undefined}
                aria-expanded={open}
                aria-invalid={error ? "true" : undefined}
                aria-required={required ? "true" : undefined}
                className={cn(
                  "flex-grow focus:outline-none",
                  asSelect && "cursor-pointer",
                )}
                id={inputId}
                onClick={(event) => {
                  if (!asSelect) event.stopPropagation();
                }}
                onChange={({ target }) => {
                  if (!asSelect) {
                    if (
                      selectedOptions[0] &&
                      target.value !== selectedOptions[0].label
                    ) {
                      setSelectedOptions([]);
                    }
                    setSearch(target.value);
                    setOpen(true);
                  }
                }}
                placeholder={placeholder}
                readOnly={asSelect}
                required={required}
                role="combobox"
                tabIndex={asSelect ? -1 : 0}
                type="text"
                value={selectedOptions[0] ? selectedOptions[0].label : search}
              />
              {selectedOptions[0] && !asSelect && (
                <button
                  aria-label="Clear"
                  className="ml-2 p-1 focus:outline-none"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedOptions([]);
                    setSearch("");
                    setOpen(true);
                  }}
                  type="button"
                >
                  &times;
                </button>
              )}
              {asSelect && (
                <ChevronDown
                  className={cn(
                    "transition-transform duration-200",
                    open && "rotate-180 transform",
                  )}
                  size={16}
                />
              )}
            </div>
          )
        }
        triggerType="click"
        width="100%"
      >
        <ul
          aria-label={`Options for ${label || "selection"}`}
          id={listboxId}
          onScroll={handleScroll}
          ref={dropdownRef}
          role="listbox"
        >
          {displayedOptions.length === 0 && (
            <li className="px-2 py-1 text-sm text-gray-500" role="status">
              {dict.noResults}
            </li>
          )}
          {displayedOptions.map((option, index) => (
            <li
              aria-selected={
                selectedOptions.find((o) => o.value === option.value)
                  ? true
                  : false
              }
              className={cn(
                "cursor-pointer px-2 py-1 hover:bg-gray-100 focus:outline-none focus-visible:bg-gray-100 dark:hover:bg-gray-800 dark:focus-visible:bg-gray-800",
                (selectedOptions.find((o) => o.value === option.value) ||
                  index === activeIndex) &&
                  "bg-gray-100 dark:bg-gray-800",
              )}
              id={`option-${option.value}`}
              key={option.value}
              onClick={() => handleSelect(option)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSelect(option);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              role="option"
              tabIndex={0}
            >
              {option.label}
            </li>
          ))}
          {loading && (
            <li className="py-2" role="status">
              <Spinner aria-label="Loading more options" />
            </li>
          )}
        </ul>
      </Popover>

      {error && (
        <FormError className="mt-1.5" id={errorId}>
          {error}
        </FormError>
      )}
    </div>
  );
}
