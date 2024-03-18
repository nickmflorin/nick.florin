"use client";
import { type ReactNode } from "react";

import type * as types from "./types";

import { TableViewContext } from "./Context";
import { useCheckedRows } from "./hooks";

export interface TableViewConfig {
  readonly isCheckable?: boolean;
  readonly useCheckedRowsQuery?: boolean;
}

export const useTableView = <T extends types.TableModel>({
  isCheckable = true,
  useCheckedRowsQuery = false,
}: TableViewConfig) => {
  const [checked, { uncheck, check }] = useCheckedRows<T>({
    enabled: isCheckable,
    useQueryParams: useCheckedRowsQuery,
  });
  return {
    isCheckable,
    checked,
    check,
    uncheck,
  };
};

export const TableViewProvider = ({
  children,
  id,
  ...config
}: TableViewConfig & { readonly children: ReactNode; readonly id: string }) => {
  const tableView = useTableView(config);
  return (
    <TableViewContext.Provider value={{ ...tableView, ready: true, id }}>
      {children}
    </TableViewContext.Provider>
  );
};
