import { type Ordering } from "~/lib/ordering";

import type { TableHeaderRowProps } from "~/components/tables-v2/generic/TableHeaderRow";
import { TableHeaderRow } from "~/components/tables-v2/generic/TableHeaderRow";
import type * as types from "~/components/tables-v2/types";

import { TableHeaderCell } from "../generic/TableHeaderCell";

import { DataTableHeaderCell } from "./DataTableHeaderCell";

export interface DataTableHeaderRowProps<D extends types.DataTableDatum, I extends string = string>
  extends Omit<TableHeaderRowProps, "children"> {
  readonly columns: types.DataTableColumnConfig<D, I>[];
  readonly excludeColumns?: I[];
  readonly ordering?: Ordering<I> | null;
  readonly rowsHaveActions?: boolean;
  readonly rowsAreSelectable?: boolean;
  readonly onSort?: (
    event: React.MouseEvent<unknown>,
    col: types.DataTableColumnConfig<D, I>,
  ) => void;
}

export const DataTableHeaderRow = <D extends types.DataTableDatum, I extends string>({
  columns,
  ordering,
  rowsHaveActions,
  rowsAreSelectable,
  excludeColumns = [],
  onSort,
  ...props
}: DataTableHeaderRowProps<D, I>): JSX.Element => (
  <TableHeaderRow {...props}>
    {rowsAreSelectable && <TableHeaderCell align="center" width={40} maxWidth={40} minWidth={40} />}
    {columns
      .filter(col => !excludeColumns.includes(col.id))
      .map(column => (
        <DataTableHeaderCell<D, I>
          key={column.id}
          column={column}
          isOrdered={ordering?.orderBy === column.id}
          order={ordering?.orderBy === column.id ? ordering.order : null}
          onSort={e => {
            if (column.isOrderable && onSort) {
              onSort(e, column);
            }
          }}
        />
      ))}
    {rowsHaveActions && <TableHeaderCell align="center" width={60} maxWidth={60} minWidth={60} />}
  </TableHeaderRow>
);
