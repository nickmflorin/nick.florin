'use client';
import { type JSX, type ReactNode, useCallback, useMemo, useState } from 'react';

import { uniq, uniqBy } from 'lodash-es';

import type * as types from './types';

import { DataTableContext } from './context';

export interface DataTableProviderProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> {
  readonly areRowsDeletable?: boolean;
  readonly areRowsSelectable?: boolean;
  readonly children: ReactNode;
  readonly columns: C[];
  readonly controlBarTargetId?: string;
  readonly hasRowActions?: boolean;
}

export const DataTableProvider = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  areRowsDeletable = false,
  areRowsSelectable = false,
  children,
  columns,
  controlBarTargetId,
  hasRowActions = false,
}: DataTableProviderProps<D, C>): JSX.Element => {
  const [selectedRows, setSelectedRows] = useState<D[]>([]);
  const [rowStates, setRowStates] = useState<types.RowLoadingState[]>([]);

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    columns.filter(c => c.isHiddenByDefault !== true && c.isHideable !== false).map(c => c.id),
  );

  const visibleColumns = useMemo(
    () => columns.filter(c => (c.isHideable === false ? true : visibleColumnIds.includes(c.id))),
    [visibleColumnIds, columns],
  );

  return (
    <DataTableContext
      value={{
        canToggleColumnVisibility: columns.some(c => c.isHideable !== false),
        changeRowSelection: useCallback((row: D, isSelected: boolean) => {
          setSelectedRows(curr =>
            isSelected ? uniqBy([...curr, row], d => d.id) : curr.filter(d => d.id !== row.id),
          );
        }, []),
        columnIsHidden: useCallback(
          (id: string) => !visibleColumnIds.includes(id),
          [visibleColumnIds],
        ),
        columnIsHideable: useCallback(
          (id): id is types.HideableTableColumn<C>['id'] =>
            columns.some(col => col.id === id && col.isHideable !== false),
          [columns],
        ),
        columnIsVisible: useCallback(
          (id: string) => visibleColumnIds.includes(id),
          [visibleColumnIds],
        ),
        columns,
        controlBarTargetId: controlBarTargetId ?? null,
        deselectRows: useCallback((rows: (D | string)[] | D | string) => {
          const ids = Array.isArray(rows)
            ? rows.map(r => (typeof r === 'string' ? r : r.id))
            : typeof rows === 'string'
              ? [rows]
              : [rows.id];
          setSelectedRows(curr => curr.filter(d => !ids.includes(d.id)));
        }, []),
        hideableColumns: [...columns].filter(
          (col): col is types.HideableTableColumn<C> => col.isHideable !== false,
        ),
        hideColumn: useCallback((id: string) => {
          setVisibleColumnIds(prev => prev.filter(v => v !== id));
        }, []),
        isInScope: true,
        orderableColumns: [...columns].filter(
          (col): col is types.OrderableTableColumn<C> => col.isOrderable === true,
        ),
        rowIsLoading: useCallback(
          (id: D | D['id']) =>
            rowStates.map(st => st.id).includes(typeof id === 'string' ? id : id.id),
          [rowStates],
        ),
        rowIsLocked: useCallback(
          (id: D | D['id']) =>
            rowStates
              .filter(st => st.locked === true)
              .map(st => st.id)
              .includes(typeof id === 'string' ? id : id.id),
          [rowStates],
        ),
        rowIsSelected: useCallback(
          (id: D | D['id']) =>
            selectedRows.map(r => r.id).includes(typeof id === 'string' ? id : id.id),
          [selectedRows],
        ),
        rowsAreDeletable: areRowsDeletable,
        rowsAreSelectable: areRowsSelectable,
        rowsHaveActions: hasRowActions,
        selectedRows,
        selectRows: useCallback(
          (rows: D | D[]) =>
            setSelectedRows(curr =>
              uniqBy([...curr, ...(Array.isArray(rows) ? rows : [rows])], d => d.id),
            ),
          [],
        ),
        setRowLoading: useCallback((id: D['id'], value: boolean, opts?: { locked?: boolean }) => {
          setRowStates(curr => {
            if (value) {
              return [...curr.filter(st => st.id !== id), { id, locked: opts?.locked !== false }];
            }
            return [...curr.filter(st => st.id !== id)];
          });
        }, []),
        setSelectedRows,
        setVisibleColumns: useCallback((ids: string[]) => setVisibleColumnIds(ids), []),
        showColumn: useCallback((id: string) => {
          setVisibleColumnIds(prev => uniq([...prev, id]));
        }, []),
        syncSelectedRows: useCallback((data: D[]) => {
          const ids = data.map(d => d.id);
          setSelectedRows(curr => curr.filter(d => ids.includes(d.id)));
        }, []),
        toggleColumnVisibility: useCallback((id: string) => {
          setVisibleColumnIds(prev =>
            prev.includes(id) ? prev.filter(v => v !== id) : uniq([...prev, id]),
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
        visibleColumns,
      }}
    >
      {children}
    </DataTableContext>
  );
};
