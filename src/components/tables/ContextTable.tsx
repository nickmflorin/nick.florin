"use client";
import { forwardRef, type ForwardedRef } from "react";

import { useTableView } from "./hooks";
import { Table } from "./Table";
import { type TableModel, type TableProps, type TableInstance } from "./types";

export const ContextTable = forwardRef(
  <T extends TableModel>(
    props: Omit<TableProps<T>, "columns">,
    ref?: ForwardedRef<TableInstance<T>>,
  ) => {
    const { visibleColumns } = useTableView<T>();
    return <Table<T> {...props} ref={ref} columns={visibleColumns} />;
  },
) as {
  <T extends TableModel>(
    props: Omit<TableProps<T>, "columns"> & { readonly ref?: ForwardedRef<TableInstance<T>> },
  ): JSX.Element;
};

export default ContextTable;
