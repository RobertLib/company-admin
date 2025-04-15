import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical, X } from "lucide-react";
import { Column, GroupAction } from ".";
import { getDictionary } from "../../../dictionaries";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import Autocomplete from "../autocomplete";
import cn from "../../../utils/cn";
import debounce from "../../../utils/debounce";
import Input from "../input";

interface TableHeadProps<T> {
  actionColumnRef: React.RefObject<HTMLTableCellElement | null>;
  actions?: (row: T) => React.ReactNode;
  calculatePosition: (columnKey: string, position: "left" | "right") => string;
  columnRefs: React.RefObject<Record<string, HTMLTableCellElement | null>>;
  dict: Awaited<ReturnType<typeof getDictionary>>;
  filters: Record<string, string>;
  groupActions?: GroupAction<T>[];
  handleDragOver: (event: React.DragEvent<HTMLElement>) => void;
  handleDragStart: (
    event: React.DragEvent<HTMLElement>,
    columnKey: string,
  ) => void;
  handleDrop: (
    event: React.DragEvent<HTMLElement>,
    targetColumnKey: string,
  ) => void;
  isAllSelected: boolean;
  order: string;
  pinnedColumns: { left: string[]; right: string[] };
  renderSubRow?: (row: T & { id: number }) => React.ReactNode;
  sortBy: string;
  sortedVisibleColumns: Column<T>[];
  toggleSelectAll: () => void;
}

export function TableHead<T>({
  actionColumnRef,
  actions,
  calculatePosition,
  columnRefs,
  dict,
  filters,
  groupActions,
  handleDragOver,
  handleDragStart,
  handleDrop,
  isAllSelected,
  order,
  pinnedColumns,
  renderSubRow,
  sortBy,
  sortedVisibleColumns,
  toggleSelectAll,
}: TableHeadProps<T>) {
  const [, setSearchParams] = useSearchParams();

  const handleSort = useCallback(
    (key: string) => {
      setSearchParams((prev) => {
        if (sortBy === key) {
          if (order === "asc") {
            prev.set("sortBy", key);
            prev.set("order", "desc");
          } else if (order === "desc") {
            prev.delete("sortBy");
            prev.delete("order");
          }
        } else {
          prev.set("sortBy", key);
          prev.set("order", "asc");
        }
        return prev;
      });
    },
    [setSearchParams, sortBy, order],
  );

  const handleFilterChange = (columnKey: string, value: string) => {
    const newFilters = { ...filters };

    if (value) {
      newFilters[columnKey] = value;
    } else {
      delete newFilters[columnKey];
    }

    setSearchParams((prev) => {
      prev.set("filters", JSON.stringify(newFilters));
      prev.set("page", "1");
      return prev;
    });
  };

  return (
    <thead className="bg-surface sticky top-10 left-0 z-2 shadow dark:shadow-gray-800">
      <tr className="divide-x divide-neutral-200">
        {renderSubRow && <th className="w-10" />}
        {groupActions && groupActions.length > 0 && (
          <th
            className="bg-surface sticky left-0 px-2 py-1 text-left"
            data-column-key="selection"
          >
            <input
              checked={isAllSelected}
              onChange={toggleSelectAll}
              type="checkbox"
            />
          </th>
        )}
        {actions && (
          <th
            className="bg-surface sticky left-0 z-1 px-2 py-1 text-left align-top text-sm font-medium"
            data-column-key="actions"
            ref={actionColumnRef}
          >
            <div className="absolute top-0 -right-[1px] h-full border-r border-neutral-200" />
            <div className="flex flex-col items-start justify-between gap-1.5">
              <span className="font-semibold">{dict.dataTable.actions}</span>
              <button
                className={cn(
                  "flex items-center gap-1 self-end rounded-md border px-2 py-0.5 text-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50",
                  Object.keys(filters).length
                    ? "border-primary-400 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10"
                    : "border-neutral-300 hover:bg-gray-50 dark:hover:bg-gray-900",
                )}
                disabled={!Object.keys(filters).length}
                onClick={() => {
                  setSearchParams((prev) => {
                    prev.delete("filters");
                    prev.delete("page");
                    return prev;
                  });
                }}
                type="button"
              >
                <X size={16} />
                {dict.dataTable.clearFilters}
              </button>
            </div>
          </th>
        )}
        {sortedVisibleColumns.map((column) => {
          const isPinnedLeft = pinnedColumns.left.includes(column.key);
          const isPinnedRight = pinnedColumns.right.includes(column.key);

          const leftPosition = isPinnedLeft
            ? calculatePosition(column.key, "left")
            : "auto";
          const rightPosition = isPinnedRight
            ? calculatePosition(column.key, "right")
            : "auto";

          return (
            <th
              aria-sort={
                sortBy === column.key
                  ? order === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className={cn(
                "px-2 py-1 text-left align-top text-sm font-medium",
                (isPinnedLeft || isPinnedRight) &&
                  "bg-surface sticky z-1 shadow dark:shadow-gray-800",
              )}
              data-column-key={column.key}
              draggable
              key={column.key}
              onDragOver={handleDragOver}
              onDragStart={(event) => handleDragStart(event, column.key)}
              onDrop={(event) => handleDrop(event, column.key)}
              ref={(el) => {
                columnRefs.current[column.key] = el;
              }}
              style={{ left: leftPosition, right: rightPosition }}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1">
                  <button
                    aria-label="Drag column"
                    className="cursor-grab opacity-50 hover:opacity-100"
                    type="button"
                  >
                    <GripVertical size={16} />
                  </button>
                  {column.sortable ? (
                    <button
                      aria-label={`Sort by ${column.label}`}
                      className="link flex items-center gap-1"
                      onClick={() => handleSort(column.key)}
                      type="button"
                    >
                      <span className="font-semibold">{column.label}</span>
                      {sortBy === column.key ? (
                        order === "asc" ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </button>
                  ) : (
                    <span className="font-semibold">{column.label}</span>
                  )}
                </div>
                {column.filter === "input" && (
                  <Input
                    aria-label={`Filter ${column.label}`}
                    dim="sm"
                    onChange={debounce(({ target }) =>
                      handleFilterChange(column.key, target.value),
                    )}
                    placeholder={`${dict.dataTable.search} ${column.label}`}
                    type="search"
                    value={filters[column.key] || ""}
                  />
                )}
                {column.filter === "select" && (
                  <Autocomplete
                    aria-label={`Filter ${column.label}`}
                    asSelect
                    hasEmpty
                    onChange={(value) => {
                      handleFilterChange(column.key, value as string);
                    }}
                    options={column.filterSelectOptions ?? []}
                    placeholder={`${dict.dataTable.search} ${column.label}`}
                    value={filters[column.key] || ""}
                  />
                )}
                {column.filter === "date" && (
                  <Input
                    aria-label={`Filter ${column.label}`}
                    dim="sm"
                    onChange={({ target }) =>
                      handleFilterChange(column.key, target.value)
                    }
                    type="date"
                    value={filters[column.key] || ""}
                  />
                )}
                {column.filter === "time" && (
                  <Input
                    aria-label={`Filter ${column.label}`}
                    dim="sm"
                    onChange={({ target }) =>
                      handleFilterChange(column.key, target.value)
                    }
                    type="time"
                    value={filters[column.key] || ""}
                  />
                )}
                {column.filter === "datetime" && (
                  <Input
                    aria-label={`Filter ${column.label}`}
                    dim="sm"
                    onChange={({ target }) =>
                      handleFilterChange(column.key, target.value)
                    }
                    type="datetime-local"
                    value={filters[column.key] || ""}
                  />
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
