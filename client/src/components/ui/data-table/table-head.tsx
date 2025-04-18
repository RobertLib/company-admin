import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from "lucide-react";
import { Column, GroupAction } from ".";
import { getDictionary } from "../../../dictionaries";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import cn from "../../../utils/cn";
import debounce from "../../../utils/debounce";
import Input from "../input";
import Select from "../select";

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
  pinnedColumns: { left: string[]; right: string[] };
  renderSubRow?: (row: T & { id: number }) => React.ReactNode;
  sortedVisibleColumns: Column<T>[];
  sortKey: string;
  sortOrder: string;
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
  pinnedColumns,
  renderSubRow,
  sortedVisibleColumns,
  sortKey,
  sortOrder,
  toggleSelectAll,
}: TableHeadProps<T>) {
  const [, setSearchParams] = useSearchParams();

  const handleSort = useCallback(
    (key: string) => {
      setSearchParams((prev) => {
        if (sortKey === key) {
          if (sortOrder === "asc") {
            prev.set("sortKey", key);
            prev.set("sortOrder", "desc");
          } else if (sortOrder === "desc") {
            prev.delete("sortKey");
            prev.delete("sortOrder");
          }
        } else {
          prev.set("sortKey", key);
          prev.set("sortOrder", "asc");
        }
        return prev;
      });
    },
    [setSearchParams, sortKey, sortOrder],
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
    <thead className="sticky top-10 left-0 z-2 bg-white shadow dark:bg-black dark:shadow-gray-800">
      <tr className="divide-x divide-gray-200 dark:divide-gray-800">
        {renderSubRow && <th className="w-10" />}
        {groupActions && groupActions.length > 0 && (
          <th
            className="sticky left-0 bg-white px-2 py-1 text-left"
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
            className="sticky left-0 z-1 bg-white px-2 py-1 text-left align-top text-sm font-medium dark:bg-black"
            data-column-key="actions"
            ref={actionColumnRef}
          >
            <div className="absolute top-0 -right-[1px] h-full border-r border-gray-200 dark:border-gray-700" />
            <div className="flex items-center justify-between">
              <span>{dict.dataTable.actions}</span>
              <button
                className="link text-primary-500 ml-2 text-sm hover:underline"
                onClick={() => {
                  setSearchParams((prev) => {
                    prev.delete("filters");
                    prev.delete("page");
                    return prev;
                  });
                }}
                type="button"
              >
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
                sortKey === column.key
                  ? sortOrder === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              className={cn(
                "px-2 py-1 text-left align-top text-sm font-medium",
                (isPinnedLeft || isPinnedRight) &&
                  "sticky z-1 bg-white shadow dark:bg-black dark:shadow-gray-800",
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
                      {column.label}
                      {sortKey === column.key ? (
                        sortOrder === "asc" ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        )
                      ) : (
                        <ArrowUpDown size={16} />
                      )}
                    </button>
                  ) : (
                    column.label
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
                  <Select
                    aria-label={`Filter ${column.label}`}
                    dim="sm"
                    hasEmpty
                    onChange={({ target }) =>
                      handleFilterChange(column.key, target.value)
                    }
                    options={column.filterSelectOptions ?? []}
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
