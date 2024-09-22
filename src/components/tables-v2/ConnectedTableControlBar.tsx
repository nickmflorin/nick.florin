"use client";
import type * as types from "./types";

import { arraysHaveSameElements } from "~/lib";

import { ConnectedColumnSelect } from "./ConnectedColumnSelect";
import { useDataTable } from "./hooks";
import { TableControlBar, type TableControlBarProps } from "./TableControlBar";

export interface ConnectedTableControlBarProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<
    TableControlBarProps<D, C>,
    | "selectedRows"
    | "allRowsAreSelected"
    | "onSelectAllRows"
    | "rowsAreDeletable"
    | "targetId"
    | "columns"
    | "onVisibleColumnsChange"
    | "visibleColumns"
  > {
  readonly data: D[];
}

export const ConnectedTableControlBar = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  data,
  ...props
}: ConnectedTableControlBarProps<D, C>): JSX.Element => {
  const { controlBarTargetId, selectedRows, rowsAreDeletable, setSelectedRows } = useDataTable<D>();

  return (
    <TableControlBar
      {...props}
      targetId={controlBarTargetId}
      selectedRows={selectedRows}
      rowsAreDeletable={rowsAreDeletable}
      columnsSelect={<ConnectedColumnSelect />}
      onSelectAllRows={v => setSelectedRows(v ? data : [])}
      allRowsAreSelected={
        data.length !== 0 &&
        arraysHaveSameElements(
          selectedRows.map(r => r.id),
          data.map(datum => datum.id),
        )
      }
    />
  );
};

export type ConnectedTableControlBarComponent = {
  <D extends types.DataTableDatum, C extends types.DataTableColumnConfig<D>>(
    props: ConnectedTableControlBarProps<D, C>,
  ): JSX.Element;
};
