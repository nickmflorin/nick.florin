import { isValidElement, type JSX } from 'react';

import { TableBodyCell } from '~/components/tables/generic/TableBodyCell';
import type * as types from '~/components/tables/types';
import { classNames } from '~/components/types';

export interface DataTableBodyCellProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> {
  readonly column: types.DataTableColumn<D, C>;
  readonly datum: D;
}

const CellAccessorContent = <D extends types.DataTableDatum>({
  accessor,
  datum,
}: {
  readonly accessor: Exclude<keyof D, 'id'>;
  readonly datum: D;
}): JSX.Element | null => {
  const v = datum[accessor];
  if (isValidElement(v) || typeof v === 'string' || typeof v === 'number') {
    return <>{v}</>;
  }
  return null;
};

export const DataTableBodyCell = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  column,
  datum,
}: DataTableBodyCellProps<D, C>): JSX.Element => (
  <TableBodyCell
    {...column.cellProps}
    align={column.config.align}
    className={classNames(column.config.columnCellClassName, column.config.bodyCellClassName)}
  >
    {column.cellRenderer ? (
      column.cellRenderer(datum)
    ) : column.config.accessor ? (
      <CellAccessorContent accessor={column.config.accessor} datum={datum} />
    ) : null}
  </TableBodyCell>
);
