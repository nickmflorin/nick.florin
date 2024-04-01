"use client";
import { forwardRef, type ForwardedRef } from "react";

import { useTableView } from "../hooks";
import {
  type TableModel,
  type TableProps,
  type TableInstance,
  type ContextTableComponent,
} from "../types";

import { Table } from "./Table";

export const ContextTable = forwardRef(
  <T extends TableModel>(
    props: Omit<TableProps<T>, "columns">,
    ref?: ForwardedRef<TableInstance<T>>,
  ) => {
    const { visibleColumns } = useTableView<T>();
    return <Table<T> {...props} ref={ref} columns={visibleColumns} />;
  },
) as ContextTableComponent;

export default ContextTable;
