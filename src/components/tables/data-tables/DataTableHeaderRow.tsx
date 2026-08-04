import { type JSX, type MouseEvent } from 'react';

import { type Ordering } from '~/lib/ordering';

import {
  TableHeaderRow,
  type TableHeaderRowProps,
} from '~/components/tables/generic/TableHeaderRow';
import type * as types from '~/components/tables/types';

import { TableHeaderCell } from '../generic/TableHeaderCell';

import { DataTableHeaderCell } from './DataTableHeaderCell';

export interface DataTableHeaderRowProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<TableHeaderRowProps, 'children'> {
  readonly areRowsSelectable?: boolean;
  readonly columns: C[];
  readonly excludeColumns?: types.TableColumnId<C>[];
  readonly hasRowActions?: boolean;
  readonly onSort?: (event: MouseEvent<unknown>, col: C) => void;
  readonly ordering?: null | Ordering<types.OrderableTableColumnId<C>>;
}

export const DataTableHeaderRow = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  areRowsSelectable,
  columns,
  excludeColumns = [],
  hasRowActions,
  onSort,
  ordering,
  ...props
}: DataTableHeaderRowProps<D, C>): JSX.Element => (
  <TableHeaderRow {...props}>
    {areRowsSelectable ? (
      <TableHeaderCell align='center' maxWidth={40} minWidth={40} width={40} />
    ) : null}
    {columns
      .filter(col => !excludeColumns.includes(col.id))
      .map(column => (
        <DataTableHeaderCell<D, C>
          column={column}
          isOrdered={ordering?.orderBy === column.id}
          key={column.id}
          onSort={e => {
            if (column.isOrderable && onSort) {
              onSort(e, column);
            }
          }}
          order={ordering?.orderBy === column.id ? ordering.order : null}
        />
      ))}
    {hasRowActions ? (
      <TableHeaderCell align='center' maxWidth={60} minWidth={60} width={60} />
    ) : null}
  </TableHeaderRow>
);
