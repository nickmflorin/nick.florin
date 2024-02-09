"use client";
import {
  Table as RootTable,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
} from "@nextui-org/table";

export interface TableProps<C extends { key: string; label: string }, T extends { id: string }> {
  readonly data: T[];
  readonly columns: C[];
}

export const Table = <C extends { key: string; label: string }, T extends { id: string }>({
  data,
  columns,
}: TableProps<C, T>): JSX.Element => (
  <RootTable>
    <TableHeader<C> columns={columns}>
      {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
    </TableHeader>
    <TableBody items={data}>
      {datum => (
        <TableRow key={datum.id}>
          {columnKey => <TableCell>{getKeyValue(datum, columnKey)}</TableCell>}
        </TableRow>
      )}
    </TableBody>
  </RootTable>
);

export default Table;
