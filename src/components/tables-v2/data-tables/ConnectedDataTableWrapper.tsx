import { type ReactNode } from "react";

import { Table, type TableProps } from "~/components/tables-v2/generic/Table";
import { TableHead } from "~/components/tables-v2/generic/TableHead";
import type * as types from "~/components/tables-v2/types";
import { type QuantitativeSize } from "~/components/types";

import {
  ConnectedDataTableHeaderRow,
  type ConnectedDataTableHeaderRowProps,
} from "./ConnectedDataTableHeaderRow";

export type ConnectedDataTableWrapperProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> = Omit<TableProps, "children"> &
  Pick<ConnectedDataTableHeaderRowProps<D, C>, "ordering" | "excludeColumns"> & {
    readonly headerHeight?: QuantitativeSize<"px">;
    readonly children: ReactNode;
    readonly onSort?: (
      event: React.MouseEvent<unknown>,
      col: types.OrderableTableColumn<C>,
    ) => void;
  };

export const ConnectedDataTableWrapper = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  ordering,
  headerHeight,
  children,
  excludeColumns,
  onSort,
  ...props
}: ConnectedDataTableWrapperProps<D, C>): JSX.Element => (
  <Table {...props}>
    <TableHead>
      <ConnectedDataTableHeaderRow<D, C>
        ordering={ordering}
        height={headerHeight}
        excludeColumns={excludeColumns}
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
