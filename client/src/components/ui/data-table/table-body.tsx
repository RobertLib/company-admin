import { Column, GroupAction } from ".";
import { Fragment, useCallback } from "react";
import { getDictionary } from "../../../dictionaries";
import { ChevronDown, ChevronRight } from "lucide-react";
import cn from "../../../utils/cn";
import Popover from "../popover";
import removeDiacritics from "../../../utils/remove-diacritics";
import Spinner from "../spinner";
import IconButton from "../icon-button";

const MAX_CELL_TEXT_LENGTH = 80;

interface TableBodyProps<T> {
  actions?: (row: T) => React.ReactNode;
  calculatePosition: (columnKey: string, position: "left" | "right") => string;
  data: (T & { id: number })[];
  dict: Awaited<ReturnType<typeof getDictionary>>;
  expandedRows: Set<number>;
  filters: Record<string, string>;
  groupActions?: GroupAction<T>[];
  loading?: boolean;
  pinnedColumns: { left: string[]; right: string[] };
  renderSubRow?: (row: T & { id: number }) => React.ReactNode;
  selectedRows: (T & { id: number })[];
  sortedVisibleColumns: Column<T>[];
  toggleRowExpansion: (rowId: number) => void;
  toggleRowSelection: (row: T & { id: number }) => void;
}

export function TableBody<T>({
  actions,
  calculatePosition,
  data,
  dict,
  expandedRows,
  filters,
  groupActions,
  loading,
  pinnedColumns,
  renderSubRow,
  selectedRows,
  sortedVisibleColumns,
  toggleRowExpansion,
  toggleRowSelection,
}: TableBodyProps<T>) {
  const highlightText = useCallback((text: string, searchValue: string) => {
    if (!searchValue) return text;

    const regex = new RegExp(`(${removeDiacritics(searchValue)})`, "gi");
    return text.replace(regex, "<b>$1</b>");
  }, []);

  return (
    <tbody className="relative divide-y divide-neutral-100">
      {(data?.length ?? 0) === 0 ? (
        loading ? (
          <>
            <tr>
              <td
                className="animate-fade-in absolute inset-0 z-10"
                colSpan={
                  sortedVisibleColumns.length +
                  (actions ? 1 : 0) +
                  (groupActions && groupActions.length > 0 ? 1 : 0) +
                  (renderSubRow ? 1 : 0)
                }
              >
                <div className="bg-surface/30 flex h-full w-full items-center justify-center">
                  <Spinner className="mx-auto" />
                </div>
              </td>
            </tr>
            {Array.from({ length: 10 }).map((_, index) => (
              <tr
                className="animate-fade-in divide-x divide-neutral-100"
                key={`skeleton-${index}`}
              >
                {renderSubRow && (
                  <td className="w-10 text-center">
                    <div className="mx-auto h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                )}
                {groupActions && groupActions.length > 0 && (
                  <td className="bg-surface sticky left-0 px-2 py-1">
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                )}
                {actions && (
                  <td className="bg-surface sticky left-0 z-1 px-2 py-1 text-sm">
                    <div className="h-6 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                )}
                {sortedVisibleColumns.map((_, colIndex) => {
                  const randomWidth = Math.floor(Math.random() * 60) + 20;
                  return (
                    <td
                      className="px-2 py-1"
                      key={`skeleton-${index}-${colIndex}`}
                    >
                      <div
                        className="h-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
                        style={{ width: `${randomWidth}%` }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </>
        ) : (
          <tr>
            <td
              className="px-2 py-1 text-sm"
              colSpan={
                sortedVisibleColumns.length +
                (actions ? 1 : 0) +
                (groupActions && groupActions.length > 0 ? 1 : 0) +
                (renderSubRow ? 1 : 0)
              }
            >
              <p className="flex min-h-[100px] items-center justify-center p-1 font-medium text-gray-500 dark:text-gray-400">
                {dict.dataTable.noData}
              </p>
            </td>
          </tr>
        )
      ) : (
        data.map((row) => (
          <Fragment key={row.id}>
            <tr className="group divide-x divide-neutral-100 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800">
              {renderSubRow && (
                <td className="w-10 text-center">
                  <IconButton
                    aria-label={
                      dict.dataTable[
                        expandedRows.has(row.id) ? "collapseRow" : "expandRow"
                      ]
                    }
                    className="mt-0.75"
                    onClick={() => toggleRowExpansion(row.id)}
                    title={
                      dict.dataTable[
                        expandedRows.has(row.id) ? "collapseRow" : "expandRow"
                      ]
                    }
                  >
                    {expandedRows.has(row.id) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </IconButton>
                </td>
              )}
              {groupActions && groupActions.length > 0 && (
                <td className="bg-surface sticky left-0 px-2 py-1">
                  <input
                    checked={selectedRows.some((r) => r.id === row.id)}
                    onChange={() => toggleRowSelection(row)}
                    type="checkbox"
                  />
                </td>
              )}
              {actions && (
                <td
                  className="bg-surface sticky left-0 z-1 px-2 py-1 text-sm transition-colors duration-150 group-hover:bg-gray-50 dark:group-hover:bg-gray-800"
                  data-column-key="actions"
                >
                  <div className="absolute top-0 -right-[1px] h-full border-r border-neutral-200 shadow" />
                  {actions(row)}
                </td>
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

                const cellContent = (column.render?.(row) ??
                  (row as Record<string, unknown>)[
                    column.key
                  ]) as React.ReactNode;

                if (
                  typeof cellContent === "string" ||
                  typeof cellContent === "number"
                ) {
                  const stringContent = String(cellContent);

                  if (stringContent.length > MAX_CELL_TEXT_LENGTH) {
                    return (
                      <td
                        className={cn(
                          "px-2 py-1 text-sm",
                          (isPinnedLeft || isPinnedRight) &&
                            "bg-surface sticky z-1 transition-colors duration-150 group-hover:bg-gray-50 dark:group-hover:bg-gray-800",
                        )}
                        key={column.key}
                        style={{ left: leftPosition, right: rightPosition }}
                      >
                        <Popover
                          contentClassName="p-2"
                          position="bottom"
                          trigger={
                            <div
                              dangerouslySetInnerHTML={{
                                __html: highlightText(
                                  stringContent.substring(
                                    0,
                                    MAX_CELL_TEXT_LENGTH,
                                  ) + "...",
                                  filters[column.key] ?? "",
                                ),
                              }}
                            />
                          }
                        >
                          {stringContent}
                        </Popover>
                      </td>
                    );
                  }

                  return (
                    <td
                      className={cn(
                        "px-2 py-1 text-sm",
                        (isPinnedLeft || isPinnedRight) &&
                          "bg-surface sticky z-1 transition-colors duration-150 group-hover:bg-gray-50 dark:group-hover:bg-gray-800",
                      )}
                      dangerouslySetInnerHTML={{
                        __html: highlightText(
                          stringContent,
                          filters[column.key] ?? "",
                        ),
                      }}
                      key={column.key}
                      style={{ left: leftPosition, right: rightPosition }}
                    />
                  );
                }

                return (
                  <td
                    className={cn(
                      "px-2 py-1 text-sm",
                      (isPinnedLeft || isPinnedRight) &&
                        "bg-surface sticky z-1 transition-colors duration-150 group-hover:bg-gray-50 dark:group-hover:bg-gray-800",
                    )}
                    key={column.key}
                    style={{ left: leftPosition, right: rightPosition }}
                  >
                    {cellContent}
                  </td>
                );
              })}
            </tr>
            {renderSubRow && expandedRows.has(row.id) && (
              <tr className="bg-gray-50 dark:bg-gray-900">
                <td
                  colSpan={
                    sortedVisibleColumns.length +
                    (actions ? 1 : 0) +
                    (groupActions && groupActions.length > 0 ? 1 : 0) +
                    1
                  }
                  className="p-4"
                >
                  {renderSubRow(row)}
                </td>
              </tr>
            )}
          </Fragment>
        ))
      )}
    </tbody>
  );
}
