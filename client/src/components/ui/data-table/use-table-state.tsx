import { use } from "react";
import { useEffect, useState } from "react";
import logger from "../../../utils/logger";
import SessionContext from "../../../contexts/session-context";

export interface TableState {
  columnOrder: string[];
  columnVisibility: Record<string, boolean>;
  pinnedColumns: { left: string[]; right: string[] };
}

export default function useTableState(
  tableId: string | undefined,
  defaultState: TableState,
): [TableState, (state: Partial<TableState>) => void] {
  const { currentUser } = use(SessionContext);
  const userIdentifier = currentUser?.email || "anonymous";

  const storageKey = tableId
    ? `table-state-${userIdentifier}-${tableId}`
    : null;

  const [state, setState] = useState<TableState>(() => {
    if (storageKey && typeof localStorage !== "undefined") {
      try {
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          return JSON.parse(savedState);
        }
      } catch (error) {
        logger.error("Failed to load table state from localStorage", error);
      }
    }
    return defaultState;
  });

  useEffect(() => {
    if (storageKey && typeof localStorage !== "undefined") {
      try {
        if (JSON.stringify(state) !== JSON.stringify(defaultState)) {
          localStorage.setItem(storageKey, JSON.stringify(state));
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        logger.error("Failed to save table state to localStorage", error);
      }
    }
  }, [defaultState, state, storageKey]);

  const updateState = (newState: Partial<TableState>) => {
    setState((prev) => {
      const updatedState = { ...prev, ...newState };

      if (storageKey && typeof localStorage !== "undefined") {
        try {
          if (JSON.stringify(updatedState) !== JSON.stringify(defaultState)) {
            localStorage.setItem(storageKey, JSON.stringify(updatedState));
          } else {
            localStorage.removeItem(storageKey);
          }
        } catch (error) {
          logger.error("Failed to save table state to localStorage", error);
        }
      }

      return updatedState;
    });
  };

  return [state, updateState];
}
