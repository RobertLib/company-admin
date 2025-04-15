import { useState, useEffect } from "react";
import logger from "../../../utils/logger";

export interface TableState {
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  pinnedColumns: { left: string[]; right: string[] };
}

export default function useTableState(
  tableId: string | undefined,
  defaultState: TableState,
): [TableState, (state: Partial<TableState>) => void] {
  const [state, setState] = useState<TableState>(defaultState);

  useEffect(() => {
    if (!tableId) return;

    try {
      const savedState = localStorage.getItem(`table-state-${tableId}`);

      if (savedState) {
        setState((prev) => ({ ...prev, ...JSON.parse(savedState) }));
      }
    } catch (error) {
      logger.error("Failed to load table state from localStorage", error);
    }
  }, [tableId]);

  const updateState = (newState: Partial<TableState>) => {
    setState((prev) => {
      const updatedState = { ...prev, ...newState };

      if (tableId) {
        try {
          localStorage.setItem(
            `table-state-${tableId}`,
            JSON.stringify(updatedState),
          );
        } catch (error) {
          logger.error("Failed to save table state to localStorage", error);
        }
      }

      return updatedState;
    });
  };

  return [state, updateState];
}
