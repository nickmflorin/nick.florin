import { type JSX } from 'react';

import { type Order } from '~/lib/ordering';

import {
  TableHeaderCell,
  type TableHeaderCellProps,
} from '~/components/tables/generic/TableHeaderCell';
import type * as types from '~/components/tables/types';
import { classNames } from '~/components/types';

export interface DataTableHeaderCellProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<TableHeaderCellProps, 'children' | 'icon' | 'id' | 'isOrderable' | 'ordering'> {
  readonly column: C;
  readonly order?: null | Order;
}

export const DataTableHeaderCell = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  column,
  order,
  ...props
}: DataTableHeaderCellProps<D, C>): JSX.Element => (
  <TableHeaderCell
    {...props}
    {...column.props}
    align={column.align ?? 'left'}
    className={classNames(column.columnCellClassName, column.headerCellClassName, props.className)}
    isOrderable={column.isOrderable}
    maxWidth={column.maxWidth}
    minWidth={column.minWidth}
    order={order}
    width={column.width}
  >
    {column.label}
  </TableHeaderCell>
);
