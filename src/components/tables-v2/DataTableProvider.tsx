"use client";
import { useCallback, useState, useMemo, type ReactNode } from "react";

import { uniqBy, uniq } from "lodash-es";

import type * as types from "./types";

import { DataTableContext } from "./context";

export interface DataTableProviderProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> {
  readonly columns: C[];
  readonly rowsAreSelectable?: boolean;
  readonly rowsHaveActions?: boolean;
  readonly rowsAreDeletable?: boolean;
  readonly children: ReactNode;
  readonly controlBarTargetId?: string;
}

export const DataTableProvider = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  columns,
  children,
  controlBarTargetId,
  rowsAreSelectable = false,
  rowsHaveActions = false,
  rowsAreDeletable = false,
}: DataTableProviderProps<D, C>): JSX.Element => {
  const [selectedRows, setSelectedRows] = useState<D[]>([]);
  const [rowStates, setRowStates] = useState<types.RowLoadingState<D>[]>([]);

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    columns.filter(c => c.isHiddenByDefault !== true && c.isHideable !== false).map(c => c.id),
  );

  const visibleColumns = useMemo(
    () => columns.filter(c => (c.isHideable !== false ? visibleColumnIds.includes(c.id) : true)),
    [visibleColumnIds, columns],
  );

  return (
    <DataTableContext.Provider
      value={{
        isInScope: true,
        controlBarTargetId: controlBarTargetId ?? null,
        selectedRows,
        rowsAreSelectable,
        rowsHaveActions,
        columns,
        rowsAreDeletable,
        visibleColumns,
        orderableColumns: [...columns].filter(
          (col): col is types.OrderableTableColumn<C> => col.isOrderable === true,
        ),
        hideableColumns: [...columns].filter(
          (col): col is types.HideableTableColumn<C> => col.isHideable !== false,
        ),
        columnIsHideable: useCallback(
          (id): id is types.HideableTableColumn<C>["id"] =>
            columns.some(col => col.id === id && col.isHideable !== false),
          [columns],
        ),
        columnIsHidden: useCallback(
          (id: string) => !visibleColumnIds.includes(id),
          [visibleColumnIds],
        ),
        columnIsVisible: useCallback(
          (id: string) => visibleColumnIds.includes(id),
          [visibleColumnIds],
        ),
        hideColumn: useCallback((id: string) => {
          setVisibleColumnIds(prev => prev.filter(v => v !== id));
        }, []),
        showColumn: useCallback((id: string) => {
          setVisibleColumnIds(prev => uniq([...prev, id]));
        }, []),
        toggleColumnVisibility: useCallback((id: string) => {
          setVisibleColumnIds(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : uniq([...prev, id]),
          );
        }, []),
        setSelectedRows,
        setVisibleColumns: useCallback((ids: string[]) => setVisibleColumnIds(ids), []),
        syncSelectedRows: useCallback((data: D[]) => {
          setSelectedRows(curr => data.filter(d => curr.map(r => r.id).includes(d.id)));
        }, []),
        selectRows: useCallback(
          (rows: D[] | D) =>
            setSelectedRows(curr =>
              uniqBy([...curr, ...(Array.isArray(rows) ? rows : [rows])], d => d.id),
            ),
          [],
        ),
        deselectRows: useCallback((rows: (D | string)[] | D | string) => {
          const ids = Array.isArray(rows)
            ? rows.map(r => (typeof r === "string" ? r : r.id))
            : typeof rows === "string"
              ? [rows]
              : [rows.id];
          setSelectedRows(curr => curr.filter(d => !ids.includes(d.id)));
        }, []),
        changeRowSelection: useCallback((row: D, isSelected: boolean) => {
          setSelectedRows(curr =>
            isSelected ? uniqBy([...curr, row], d => d.id) : curr.filter(d => d.id !== row.id),
          );
        }, []),
        toggleRowSelection: useCallback(
          (row: D) =>
            setSelectedRows(curr =>
              curr.map(d => d.id).includes(row.id)
                ? curr.filter(d => d.id !== row.id)
                : [...curr, row],
            ),
          [],
        ),
        rowIsSelected: useCallback(
          (id: D["id"]) => selectedRows.map(r => r.id).includes(id),
          [selectedRows],
        ),
        rowIsLoading: useCallback(
          (id: D["id"]) => rowStates.map(st => st.id).includes(id),
          [rowStates],
        ),
        rowIsLocked: useCallback(
          (id: D["id"]) =>
            rowStates
              .filter(st => st.locked === true)
              .map(st => st.id)
              .includes(id),
          [rowStates],
        ),
        setRowLoading: useCallback((id: D["id"], value: boolean, opts?: { locked?: boolean }) => {
          setRowStates(curr => {
            if (value) {
              return [...curr.filter(st => st.id !== id), { id, locked: opts?.locked !== false }];
            }
            return [...curr.filter(st => st.id !== id)];
          });
        }, []),
      }}
    >
      {children}
    </DataTableContext.Provider>
  );
};
