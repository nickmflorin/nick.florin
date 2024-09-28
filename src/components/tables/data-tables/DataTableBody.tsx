import type * as types from "~/components/tables/types";

import { type AbstractDataTableBodyProps, AbstractDataTableBody } from "./AbstractDataTableBody";
import { DataTableBodyRow } from "./DataTableBodyRow";

export interface DataTableBodyProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<AbstractDataTableBodyProps<D, C>, "children"> {
  readonly performSelectionWhenClicked?: boolean;
  readonly rowIsSelected?: (datum: D["id"]) => boolean;
  readonly onRowSelected?: (datum: D, isSelected: boolean) => void;
}

export const DataTableBody = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  rowIsSelected,
  onRowSelected,
  performSelectionWhenClicked,
  ...props
}: DataTableBodyProps<D, C>): JSX.Element => (
  <AbstractDataTableBody {...props}>
    {ps => (
      <DataTableBodyRow<D, C>
        {...ps}
        performSelectionWhenClicked={performSelectionWhenClicked}
        isSelected={rowIsSelected?.(ps.datum.id)}
        onRowSelected={onRowSelected}
      />
    )}
  </AbstractDataTableBody>
);
