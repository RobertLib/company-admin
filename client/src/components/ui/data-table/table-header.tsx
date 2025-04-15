import { Column } from ".";
import {
  Columns3,
  GripVertical,
  Maximize,
  Minimize,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import cn from "../../../utils/cn";
import Dropdown from "../dropdown";
import IconButton from "../icon-button";
import Switch from "../switch";

interface TableHeaderProps<T> {
  columnOrder: string[];
  columns: Column<T>[];
  columnVisibility: Record<string, boolean>;
  handleDragOver: (event: React.DragEvent<HTMLElement>) => void;
  handleDragStart: (
    event: React.DragEvent<HTMLElement>,
    columnKey: string,
  ) => void;
  handleDrop: (event: React.DragEvent<HTMLElement>, columnKey: string) => void;
  handlePinColumn: (columnKey: string, position: "left" | "right") => void;
  isFullScreen: boolean;
  onResetSettings: () => void;
  pinnedColumns: { left: string[]; right: string[] };
  setColumnVisibility: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  toolbar: React.ReactNode;
}

export function TableHeader<T>({
  columnOrder,
  columns,
  columnVisibility,
  handleDragOver,
  handleDragStart,
  handleDrop,
  handlePinColumn,
  isFullScreen,
  onResetSettings,
  pinnedColumns,
  setColumnVisibility,
  setIsFullScreen,
  toolbar,
}: TableHeaderProps<T>) {
  const hasCustomSettings = () => {
    const defaultColumnOrder = columns.map((col) => col.key);
    const isColumnOrderChanged =
      columnOrder.length !== defaultColumnOrder.length ||
      !columnOrder.every((col, index) => col === defaultColumnOrder[index]);

    const isColumnVisibilityChanged = Object.values(columnVisibility).some(
      (visible) => !visible,
    );

    const isPinnedColumnsChanged =
      pinnedColumns.left.length > 0 || pinnedColumns.right.length > 0;

    return (
      isColumnOrderChanged ||
      isColumnVisibilityChanged ||
      isPinnedColumnsChanged
    );
  };

  return (
    <header className="bg-surface sticky top-0 left-0 z-3 flex h-10 items-start justify-between p-2 pb-0">
      <div>{toolbar}</div>
      <div className="flex items-center gap-2">
        <Dropdown
          items={[
            <div className="mb-1 border-b border-neutral-200 pb-1" key="reset">
              <button
                className="w-full cursor-pointer rounded p-1.5 text-left text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-200 dark:hover:bg-gray-800"
                disabled={!hasCustomSettings()}
                onClick={onResetSettings}
                type="button"
              >
                Reset
              </button>
            </div>,
            ...[...columns]
              .sort(
                (a, b) =>
                  columnOrder.indexOf(a.key) - columnOrder.indexOf(b.key),
              )
              .map((column) => (
                <div
                  className="flex items-center p-1"
                  draggable
                  key={column.key}
                  onDragOver={handleDragOver}
                  onDragStart={(event) => handleDragStart(event, column.key)}
                  onDrop={(event) => handleDrop(event, column.key)}
                >
                  <button
                    aria-label="Drag column"
                    className="mr-2 cursor-grab opacity-50 hover:opacity-100"
                    type="button"
                  >
                    <GripVertical size={16} />
                  </button>
                  <button
                    aria-label={`Pin column ${column.label} to left`}
                    aria-pressed={pinnedColumns.left.includes(column.key)}
                    className={cn(
                      "mr-2 cursor-pointer opacity-50 hover:opacity-100",
                      pinnedColumns.left.includes(column.key) &&
                        "text-primary-500 opacity-100",
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePinColumn(column.key, "left");
                    }}
                    type="button"
                  >
                    <PanelLeft aria-hidden="true" size={16} />
                  </button>
                  <button
                    aria-label={`Pin column ${column.label} to right`}
                    className={cn(
                      "mr-2 cursor-pointer opacity-50 hover:opacity-100",
                      pinnedColumns.right.includes(column.key) &&
                        "text-primary-500 opacity-100",
                    )}
                    onClick={(event) => {
                      event.stopPropagation();
                      handlePinColumn(column.key, "right");
                    }}
                    type="button"
                  >
                    <PanelRight aria-hidden="true" size={16} />
                  </button>
                  <Switch
                    className="ml-1"
                    checked={columnVisibility[column.key]}
                    onChange={({ target }) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [column.key]: target.checked,
                      }))
                    }
                  />
                  <span className="ml-3 text-sm font-medium">
                    {column.label}
                  </span>
                </div>
              )),
          ]}
          trigger={<Columns3 aria-label="Toggle column visibility" size={18} />}
        />

        <IconButton
          aria-label="Toggle full screen"
          aria-pressed={isFullScreen}
          onClick={() => setIsFullScreen((prev) => !prev)}
        >
          {isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </IconButton>
      </div>
    </header>
  );
}
