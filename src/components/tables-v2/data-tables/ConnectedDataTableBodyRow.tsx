import { useDataTable } from "~/components/tables-v2/hooks";
import type * as types from "~/components/tables-v2/types";

import { DataTableBodyRow, type DataTableBodyRowProps } from "./DataTableBodyRow";

export interface ConnectedDataTableBodyRowProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<DataTableBodyRowProps<D, C>, "rowIsSelected" | "onRowSelected"> {}

export const ConnectedDataTableBodyRow = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>(
  props: ConnectedDataTableBodyRowProps<D, C>,
): JSX.Element => {
  const { rowIsLoading, rowIsLocked, rowIsSelected, changeRowSelection, columnIsVisible } =
    useDataTable();
  return (
    <DataTableBodyRow
      {...props}
      isLoading={rowIsLoading(props.datum.id)}
      isLocked={rowIsLocked(props.datum.id)}
      rowIsSelected={rowIsSelected}
      onRowSelected={(datum, isSelected) => changeRowSelection(datum, isSelected)}
      columns={props.columns.filter(col => columnIsVisible(col.id))}
    />
  );
};
