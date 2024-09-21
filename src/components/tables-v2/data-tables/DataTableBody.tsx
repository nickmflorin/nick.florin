import type * as types from "~/components/tables-v2/types";

import { type AbstractDataTableBodyProps, AbstractDataTableBody } from "./AbstractDataTableBody";
import { DataTableBodyRow } from "./DataTableBodyRow";

export interface DataTableBodyProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<AbstractDataTableBodyProps<D, C>, "children"> {
  readonly rowIsSelected?: (datum: D) => boolean;
  readonly onRowSelected?: (datum: D, isSelected: boolean) => void;
}

export const DataTableBody = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  rowIsSelected,
  onRowSelected,
  ...props
}: DataTableBodyProps<D, C>): JSX.Element => (
  <AbstractDataTableBody {...props}>
    {ps => (
      <DataTableBodyRow<D, C> {...ps} rowIsSelected={rowIsSelected} onRowSelected={onRowSelected} />
    )}
  </AbstractDataTableBody>
);
