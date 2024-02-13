import { type DataTableColumn } from "mantine-datatable";

export interface TableProps<T extends { id: string }> {
  readonly data: T[];
  readonly columns: DataTableColumn<T>[];
}
