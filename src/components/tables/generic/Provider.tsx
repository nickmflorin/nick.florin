import dynamic from "next/dynamic";
import { type ReactNode, useState, useCallback, useMemo, memo } from "react";

import { uniq } from "lodash-es";

import { Spinner } from "~/components/icons/Spinner";
import { Checkbox } from "~/components/input/Checkbox";

import { useCheckedRows } from "../hooks";
import * as types from "../types";

import { TableViewContext } from "./Context";

const ActionsCell = dynamic(() => import("./cells/ActionsCell"));

type RowLoadingState<T extends types.TableModel> = {
  readonly id: T["id"];
  readonly locked?: boolean;
};

export interface TableViewConfig<T extends types.TableModel> {
  readonly isCheckable?: boolean;
  readonly useCheckedRowsQuery?: boolean;
  readonly columns: types.Column<T>[];
  readonly canToggleColumnVisibility?: boolean;
  readonly children: ReactNode;
  readonly id: string;
  readonly deleteIsDisabled?: boolean;
  readonly deleteErrorMessage?: string;
  readonly onEdit?: (id: string, m: T) => void;
  readonly deleteAction?: (id: string) => Promise<void>;
}

export const useTableView = <T extends types.TableModel>({
  isCheckable = true,
  deleteIsDisabled = false,
  deleteErrorMessage = "There was an error deleting the row.",
  onEdit,
  deleteAction,
  useCheckedRowsQuery = false,
  columns: _columns,
}: Omit<TableViewConfig<T>, "id" | "children" | "canToggleColumnVisibility">): Omit<
  types.TableView<T>,
  "isReady" | "id" | "canToggleColumnVisibility"
> => {
  const [rowStates, setRowStates] = useState<RowLoadingState<T>[]>([]);

  const [checked, { uncheck, check }] = useCheckedRows<T>({
    enabled: isCheckable,
    useQueryParams: useCheckedRowsQuery,
  });

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    _columns
      .filter(c => c.defaultVisible !== false && c.isHideable !== false)
      .map(c => types.getColId(c)),
  );

  const columns = useMemo(() => {
    let cs: types.Column<T>[] = [..._columns];
    if (isCheckable) {
      cs = [
        {
          id: "checkable",
          title: "",
          accessor: "checkable",
          width: "32px",
          cellsClassName: "loading-cell",
          isHideable: false,
          render: ({ model }) => (
            <div className="flex flex-row items-center justify-center">
              <Checkbox
                value={checked.includes(model.id)}
                onChange={e => {
                  if (e.target.checked) {
                    check?.(model);
                  } else {
                    uncheck?.(model.id);
                  }
                }}
              />
            </div>
          ),
        },
        {
          title: "",
          accessor: "loading",
          width: "24px",
          cellsClassName: "loading-cell",
          isHideable: false,
          render: ({ model }) => (
            <div className="flex flex-row items-center justify-center">
              <Spinner size="16px" isLoading={rowStates.map(st => st.id).includes(model.id)} />
            </div>
          ),
        },
        ...cs,
      ];
    }
    if (deleteAction || onEdit) {
      cs = [
        ...cs,
        {
          accessor: "actions",
          title: "",
          textAlign: "center",
          isHideable: false,
          render: ({ model }) => (
            <ActionsCell
              deleteErrorMessage={deleteErrorMessage}
              deleteAction={deleteAction ? deleteAction.bind(null, model.id) : undefined}
              onEdit={onEdit ? () => onEdit(model.id, model) : undefined}
              deleteIsDisabled={deleteIsDisabled}
            />
          ),
        },
      ];
    }
    return cs.map(col => ({ noWrap: true, ...col }));
  }, [
    _columns,
    rowStates,
    checked,
    isCheckable,
    deleteErrorMessage,
    uncheck,
    check,
    deleteAction,
    deleteIsDisabled,
    onEdit,
  ]);

  const setRowLoading = useCallback((id: T["id"], value: boolean, opts?: { locked?: boolean }) => {
    setRowStates(curr => {
      if (value) {
        return [...curr.filter(st => st.id !== id), { id, locked: opts?.locked !== false }];
      }
      return [...curr.filter(st => st.id !== id)];
    });
  }, []);

  const visibleColumns = useMemo(
    () =>
      columns.filter(c =>
        c.isHideable !== false ? visibleColumnIds.includes(types.getColId(c)) : true,
      ),
    [visibleColumnIds, columns],
  );

  const hideColumn = useCallback((id: string) => {
    setVisibleColumnIds(prev => prev.filter(v => v !== id));
  }, []);

  const showColumn = useCallback((id: string) => {
    setVisibleColumnIds(prev => uniq([...prev, id]));
  }, []);

  return {
    columns,
    visibleColumns,
    isCheckable,
    checked,
    visibleColumnIds,
    hideColumn,
    showColumn,
    check,
    uncheck,
    setVisibleColumns: setVisibleColumnIds,
    setRowLoading,
    rowIsLoading: useCallback(
      (id: T["id"]) => rowStates.map(st => st.id).includes(id),
      [rowStates],
    ),
    rowIsLocked: useCallback(
      (id: T["id"]) =>
        rowStates
          .filter(st => st.locked === true)
          .map(st => st.id)
          .includes(id),
      [rowStates],
    ),
  };
};

export const TableViewProvider = memo(
  <T extends types.TableModel>({
    children,
    id,
    canToggleColumnVisibility = false,
    ...config
  }: TableViewConfig<T>) => {
    const tableView = useTableView<T>(config);
    return (
      <TableViewContext.Provider<T>
        value={{ ...tableView, isReady: true, id, canToggleColumnVisibility }}
      >
        {children}
      </TableViewContext.Provider>
    );
  },
) as {
  <T extends types.TableModel>(props: TableViewConfig<T>): JSX.Element;
};

export default TableViewProvider;
