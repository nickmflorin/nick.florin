"use client";
import { arraysHaveSameElements } from "~/lib";

import type { DataTableDatum } from "~/components/tables-v2/types";

import { useDataTable } from "./hooks";
import { TableControlBar, type TableControlBarProps } from "./TableControlBar";

export interface ConnectedTableControlBarProps<D extends DataTableDatum>
  extends Omit<
    TableControlBarProps<D>,
    "selectedRows" | "allRowsAreSelected" | "onSelectAllRows" | "rowsAreDeletable" | "targetId"
  > {
  readonly data: D[];
}

export const ConnectedTableControlBar = <D extends DataTableDatum>({
  data,
  ...props
}: ConnectedTableControlBarProps<D>): JSX.Element => {
  const { controlBarTargetId, selectedRows, rowsAreDeletable, setSelectedRows } = useDataTable<D>();

  return (
    <TableControlBar
      {...props}
      targetId={controlBarTargetId}
      selectedRows={selectedRows}
      rowsAreDeletable={rowsAreDeletable}
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
