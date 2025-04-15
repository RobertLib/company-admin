import { useCallback, useMemo, useState } from "react";

export default function useRowSelection<T>(data: (T & { id: number })[]) {
  const [selectedRows, setSelectedRows] = useState<(T & { id: number })[]>([]);

  const toggleRowSelection = useCallback((row: T & { id: number }) => {
    setSelectedRows((prev) =>
      prev.some((r) => r.id === row.id)
        ? prev.filter((r) => r.id !== row.id)
        : [...prev, row],
    );
  }, []);

  const isAllSelected = useMemo(
    () => data.length > 0 && selectedRows.length === data.length,
    [data.length, selectedRows.length],
  );

  const toggleSelectAll = useCallback(() => {
    setSelectedRows((prev) => (prev.length === data.length ? [] : [...data]));
  }, [data]);

  return {
    isAllSelected,
    selectedRows,
    setSelectedRows,
    toggleRowSelection,
    toggleSelectAll,
  };
}
