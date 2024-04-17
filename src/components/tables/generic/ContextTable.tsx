"use client";
import clsx from "clsx";

import { useTableView } from "../hooks";
import {
  type TableModel,
  type TableProps,
  type RootColumn,
  mergeRowClassNames,
  toNativeColumn,
} from "../types";

import { Table } from "./Table";

export const ContextTable = <T extends TableModel>(props: Omit<TableProps<T>, "columns">) => {
  const view = useTableView<T>();
  return (
    <Table<T>
      {...props}
      columns={view.visibleColumns.map((col): RootColumn<T> => toNativeColumn(col, view))}
      rowClassName={mergeRowClassNames(props.rowClassName, ({ id }) =>
        clsx({ "row--loading": view.rowIsLoading(id), "row--locked": view.rowIsLocked(id) }),
      )}
    />
  );
};

export default ContextTable;
