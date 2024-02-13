"use client";
import { DataTable } from "mantine-datatable";

import { type TableProps } from "./types";

export const Table = <T extends { id: string }>({ data, columns }: TableProps<T>): JSX.Element => (
  <DataTable columns={columns} records={data} />
);

export default Table;
