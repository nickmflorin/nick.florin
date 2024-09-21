import { isValidElement } from "react";

import { TableBodyCell } from "~/components/tables-v2/generic/TableBodyCell";
import type * as types from "~/components/tables-v2/types";
import { classNames } from "~/components/types";

export interface DataTableBodyCellProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> {
  readonly datum: D;
  readonly column: types.DataTableColumn<D, C>;
}

const CellAccessorContent = <D extends types.DataTableDatum>({
  datum,
  accessor,
}: {
  datum: D;
  accessor: Exclude<keyof D, "id">;
}): JSX.Element => {
  const v = datum[accessor];
  if (isValidElement(v) || typeof v === "string" || typeof v === "number") {
    return <>{v}</>;
  }
  return <></>;
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
      <CellAccessorContent datum={datum} accessor={column.config.accessor} />
    ) : (
      <></>
    )}
  </TableBodyCell>
);
