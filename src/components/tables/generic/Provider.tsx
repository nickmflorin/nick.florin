import dynamic from "next/dynamic";
import { type ReactNode, useState, useCallback } from "react";

import uniq from "lodash.uniq";

import { Checkbox } from "~/components/input/Checkbox";
import { useDeepEqualMemo } from "~/hooks";

import { useCheckedRows } from "../hooks";
import * as types from "../types";

import { TableViewContext } from "./Context";

const ActionsCell = dynamic(() => import("./cells/ActionsCell"));

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
  const [checked, { uncheck, check }] = useCheckedRows<T>({
    enabled: isCheckable,
    useQueryParams: useCheckedRowsQuery,
  });

  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(
    _columns
      .filter(c => c.defaultVisible !== false && c.isHideable !== false)
      .map(c => types.getColId(c)),
  );

  const columns = useDeepEqualMemo(() => {
    let cs: types.Column<T>[] = [..._columns];
    if (isCheckable) {
      cs = [
        {
          id: "checkable",
          title: "",
          accessor: "checkable",
          width: "40px",
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
          width: 140,
          isHideable: false,
          render: ({ model }) => (
            <ActionsCell
              deleteErrorMessage="There was an error deleting the skill."
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
    checked,
    isCheckable,
    uncheck,
    check,
    deleteAction,
    deleteErrorMessage,
    deleteIsDisabled,
    onEdit,
  ]);

  const visibleColumns = useDeepEqualMemo(
    () =>
      columns.filter(c =>
        c.isHideable !== false ? visibleColumnIds.includes(types.getColId(c)) : true,
      ),
    [columns, visibleColumnIds],
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
  };
};

export const TableViewProvider = <T extends types.TableModel>({
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
};

export default TableViewProvider;
