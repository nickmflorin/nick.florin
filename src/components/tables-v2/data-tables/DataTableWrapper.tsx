import { type ReactNode } from "react";

import { Table, type TableProps } from "~/components/tables-v2/generic/Table";
import { TableHead } from "~/components/tables-v2/generic/TableHead";
import type * as types from "~/components/tables-v2/types";
import { type QuantitativeSize } from "~/components/types";

import { DataTableHeaderRow, type DataTableHeaderRowProps } from "./DataTableHeaderRow";

export type DataTableWrapperProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> = Omit<TableProps, "children"> &
  Pick<
    DataTableHeaderRowProps<D, C>,
    "rowsHaveActions" | "rowsAreSelectable" | "columns" | "ordering" | "excludeColumns"
  > & {
    readonly headerHeight?: QuantitativeSize<"px">;
    readonly children: ReactNode;
    readonly onSort?: (
      event: React.MouseEvent<unknown>,
      col: types.OrderableTableColumn<C>,
    ) => void;
  };

export const DataTableWrapper = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  ordering,
  headerHeight,
  children,
  columns,
  rowsHaveActions,
  rowsAreSelectable,
  excludeColumns,
  onSort,
  ...props
}: DataTableWrapperProps<D, C>): JSX.Element => (
  <Table {...props}>
    <TableHead>
      <DataTableHeaderRow<D, C>
        columns={columns}
        ordering={ordering}
        height={headerHeight}
        excludeColumns={excludeColumns}
        rowsHaveActions={rowsHaveActions}
        rowsAreSelectable={rowsAreSelectable}
        onSort={(e, col) => {
          if (col.isOrderable) {
            onSort?.(e, col as types.OrderableTableColumn<C>);
          }
        }}
      />
    </TableHead>
    {children}
  </Table>
);
