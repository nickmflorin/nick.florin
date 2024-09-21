import { type Order } from "~/lib/ordering";

import {
  TableHeaderCell,
  type TableHeaderCellProps,
} from "~/components/tables-v2/generic/TableHeaderCell";
import type * as types from "~/components/tables-v2/types";
import { classNames } from "~/components/types";

export interface DataTableHeaderCellProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<TableHeaderCellProps, "ordering" | "icon" | "id" | "isOrderable" | "children"> {
  readonly column: C;
  readonly order?: Order | null;
}

export const DataTableHeaderCell = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  order,
  column,
  ...props
}: DataTableHeaderCellProps<D, C>): JSX.Element => (
  <TableHeaderCell
    {...props}
    {...column.props}
    className={classNames(column.columnCellClassName, column.headerCellClassName, props.className)}
    align={column.align ?? "left"}
    isOrderable={column.isOrderable}
    order={order}
    width={column.width}
    maxWidth={column.maxWidth}
    minWidth={column.minWidth}
  >
    {column.label}
  </TableHeaderCell>
);
