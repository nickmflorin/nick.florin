"use client";
import type * as types from "./types";

import { ShowHide } from "~/components/util";

import { ColumnSelect, type ColumnSelectProps } from "./ColumnSelect";
import { useDataTable } from "./hooks";

export interface ConnectedColumnSelectProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<ColumnSelectProps<D, C>, "columns" | "onChange" | "value"> {}

export const ConnectedColumnSelect = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>(
  props: ConnectedColumnSelectProps<D, C>,
) => {
  const { columns, canToggleColumnVisibility, visibleColumns, setVisibleColumns } = useDataTable<
    D,
    C
  >();

  return (
    <ShowHide show={canToggleColumnVisibility}>
      <ColumnSelect<D, C>
        {...props}
        columns={columns}
        onChange={v => setVisibleColumns(v)}
        value={visibleColumns.map(c => c.id)}
      />
    </ShowHide>
  );
};
