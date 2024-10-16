import { useEffect } from "react";

import { useDataTable } from "~/components/tables/hooks";
import type * as types from "~/components/tables/types";

import { type AbstractDataTableBodyProps, AbstractDataTableBody } from "./AbstractDataTableBody";
import { ConnectedDataTableBodyRow } from "./ConnectedDataTableBodyRow";

export interface ConnectedDataTableBodyProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<AbstractDataTableBodyProps<D, C>, "columns" | "children"> {
  readonly performSelectionWhenClicked?: boolean;
}

export const ConnectedDataTableBody = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  performSelectionWhenClicked,
  ...props
}: ConnectedDataTableBodyProps<D, C>): JSX.Element => {
  const { columns, syncSelectedRows } = useDataTable<D, C>();

  useEffect(() => {
    syncSelectedRows(props.data);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [props.data]);

  return (
    <AbstractDataTableBody {...props} columns={columns}>
      {ps => (
        <ConnectedDataTableBodyRow<D, C>
          {...ps}
          performSelectionWhenClicked={performSelectionWhenClicked}
        />
      )}
    </AbstractDataTableBody>
  );
};
