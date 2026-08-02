import { type JSX, type MouseEvent, type ReactNode } from 'react';

import { Table, type TableProps } from '~/components/tables/generic/Table';
import { TableHead } from '~/components/tables/generic/TableHead';
import type * as types from '~/components/tables/types';
import { type QuantitativeSize } from '~/components/types';

import {
  ConnectedDataTableHeaderRow,
  type ConnectedDataTableHeaderRowProps,
} from './ConnectedDataTableHeaderRow';

export type ConnectedDataTableWrapperProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> = {
  readonly children: ReactNode;
  readonly headerHeight?: QuantitativeSize<'px'>;
  readonly onSort?: (event: MouseEvent<unknown>, col: types.OrderableTableColumn<C>) => void;
} & Omit<TableProps, 'children'> &
  Pick<ConnectedDataTableHeaderRowProps<D, C>, 'excludeColumns' | 'ordering'>;

export const ConnectedDataTableWrapper = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  children,
  excludeColumns,
  headerHeight,
  onSort,
  ordering,
  ...props
}: ConnectedDataTableWrapperProps<D, C>): JSX.Element => (
  <Table {...props}>
    <TableHead>
      <ConnectedDataTableHeaderRow<D, C>
        excludeColumns={excludeColumns}
        height={headerHeight}
        onSort={(e, col) => {
          if (col.isOrderable) {
            onSort?.(e, col as types.OrderableTableColumn<C>);
          }
        }}
        ordering={ordering}
      />
    </TableHead>
    {children}
  </Table>
);
