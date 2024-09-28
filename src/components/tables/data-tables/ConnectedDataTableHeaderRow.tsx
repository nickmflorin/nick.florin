import { useDataTable } from "~/components/tables/hooks";
import type * as types from "~/components/tables/types";

import { DataTableHeaderRow, type DataTableHeaderRowProps } from "./DataTableHeaderRow";

export interface ConnectedDataTableHeaderRowProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<
    DataTableHeaderRowProps<D, C>,
    "columns" | "rowsHaveActions" | "rowsAreSelectable"
  > {}

export const ConnectedDataTableHeaderRow = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>(
  props: ConnectedDataTableHeaderRowProps<D, C>,
): JSX.Element => {
  const { visibleColumns, rowsHaveActions, rowsAreSelectable } = useDataTable<D, C>();

  return (
    <DataTableHeaderRow<D, C>
      {...props}
      columns={visibleColumns}
      rowsHaveActions={rowsHaveActions}
      rowsAreSelectable={rowsAreSelectable}
    />
  );
};
