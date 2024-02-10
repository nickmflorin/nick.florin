"use client";
import { DataTable, type DataTableColumn } from "mantine-datatable";

export interface TableProps<T extends { id: string }> {
  readonly data: T[];
  readonly columns: DataTableColumn<T>[];
}

export const Table = <T extends { id: string }>({ data, columns }: TableProps<T>): JSX.Element => (
  <DataTable columns={columns} records={data} />
);

export default Table;
