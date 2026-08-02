import { type JSX, type MouseEvent, type ReactNode } from 'react';

import { Table, type TableProps } from '~/components/tables/generic/Table';
import { TableHead } from '~/components/tables/generic/TableHead';
import type * as types from '~/components/tables/types';
import { type QuantitativeSize } from '~/components/types';

import { DataTableHeaderRow, type DataTableHeaderRowProps } from './DataTableHeaderRow';

export type DataTableWrapperProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> = {
  readonly children: ReactNode;
  readonly headerHeight?: QuantitativeSize<'px'>;
  readonly onSort?: (event: MouseEvent<unknown>, col: types.OrderableTableColumn<C>) => void;
} & Omit<TableProps, 'children'> &
  Pick<
    DataTableHeaderRowProps<D, C>,
    'areRowsSelectable' | 'columns' | 'excludeColumns' | 'hasRowActions' | 'ordering'
  >;

export const DataTableWrapper = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  areRowsSelectable,
  children,
  columns,
  excludeColumns,
  hasRowActions,
  headerHeight,
  onSort,
  ordering,
  ...props
}: DataTableWrapperProps<D, C>): JSX.Element => (
  <Table {...props}>
    <TableHead>
      <DataTableHeaderRow<D, C>
        areRowsSelectable={areRowsSelectable}
        columns={columns}
        excludeColumns={excludeColumns}
        hasRowActions={hasRowActions}
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
