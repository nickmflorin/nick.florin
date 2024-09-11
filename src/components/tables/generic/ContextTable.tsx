"use client";
import { classNames } from "~/components/types";

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
  const { visibleColumns, setRowLoading, rowIsLoading, rowIsLocked } = useTableView<T>();
  return (
    <Table<T>
      {...props}
      columns={visibleColumns.map((col): RootColumn<T> => toNativeColumn(col, { setRowLoading }))}
      rowClassName={mergeRowClassNames(props.rowClassName, ({ id }) =>
        classNames({ "row--loading": rowIsLoading(id), "row--locked": rowIsLocked(id) }),
      )}
    />
  );
};

export default ContextTable;
