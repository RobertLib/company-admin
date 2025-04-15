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
    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
      {(data?.length ?? 0) === 0 ? (
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
            {loading ? (
              <Spinner className="p-4" />
            ) : (
              <p className="flex min-h-[100px] items-center justify-center p-1 font-medium text-gray-500 dark:text-gray-400">
                {dict.dataTable.noData}
              </p>
            )}
          </td>
        </tr>
      ) : (
        data.map((row) => (
          <Fragment key={row.id}>
            <tr className="divide-x divide-gray-200 dark:divide-gray-800">
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
                <td className="sticky left-0 bg-white px-2 py-1">
                  <input
                    checked={selectedRows.some((r) => r.id === row.id)}
                    onChange={() => toggleRowSelection(row)}
                    type="checkbox"
                  />
                </td>
              )}
              {actions && (
                <td
                  className="sticky left-0 z-1 bg-white px-2 py-1 text-sm dark:bg-black"
                  data-column-key="actions"
                >
                  <div className="absolute top-0 -right-[1px] h-full border-r border-gray-200 dark:border-gray-700" />
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
                            "sticky z-1 bg-white dark:bg-black",
                        )}
                        key={column.key}
                        style={{ left: leftPosition, right: rightPosition }}
                      >
                        <Popover
                          content={stringContent}
                          position="bottom"
                          trigger="hover"
                        >
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
                        </Popover>
                      </td>
                    );
                  }

                  return (
                    <td
                      className={cn(
                        "px-2 py-1 text-sm",
                        (isPinnedLeft || isPinnedRight) &&
                          "sticky z-1 bg-white dark:bg-black",
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
                        "sticky z-1 bg-white dark:bg-black",
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
