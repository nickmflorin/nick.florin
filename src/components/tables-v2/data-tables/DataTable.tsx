import { type Ordering } from "~/lib/ordering";

import type * as types from "~/components/tables-v2/types";
import { useOrdering } from "~/hooks/use-ordering";

import { DataTableBody, type DataTableBodyProps } from "./DataTableBody";
import { type DataTableWrapperProps, DataTableWrapper } from "./DataTableWrapper";

export interface DataTableProps<D extends types.DataTableDatum, I extends string = string>
  extends Omit<
      DataTableWrapperProps<D, I>,
      "children" | "onSort" | "columns" | "rowsHaveActions" | "rowsAreSelectable"
    >,
    Pick<
      DataTableBodyProps<D, I>,
      | "getRowActions"
      | "rowIsSelected"
      | "onRowSelected"
      | "actionMenuWidth"
      | "onRowClick"
      | "getRowId"
      | "columns"
      | "skeletonRowHeight"
      | "numSkeletonRows"
      | "emptyContent"
      | "isEmpty"
      | "isLoading"
      | "rowHeight"
      | "highlightRowOnHover"
      | "rowHoveredClassName"
      | "data"
      | "loadingIndicator"
    > {
  readonly onSort?: (
    event: React.MouseEvent<unknown>,
    col: types.DataTableColumnConfig<D, I>,
    ordering: Ordering<I> | null,
  ) => void;
}

export const DataTable = <D extends types.DataTableDatum, I extends string>({
  data,
  rowHoveredClassName,
  highlightRowOnHover,
  rowHeight,
  ordering: propOrdering,
  numSkeletonRows,
  skeletonRowHeight,
  isEmpty,
  emptyContent,
  isLoading,
  loadingIndicator,
  actionMenuWidth,
  getRowId,
  onRowClick,
  rowIsSelected,
  onRowSelected,
  getRowActions,
  ...props
}: DataTableProps<D, I>): JSX.Element => {
  const [_ordering, setOrdering, applyOrderingUpdate] = useOrdering<I>();
  const ordering = propOrdering === undefined ? _ordering : propOrdering;

  return (
    <DataTableWrapper<D, I>
      {...props}
      rowsHaveActions={getRowActions !== undefined}
      rowsAreSelectable={rowIsSelected !== undefined}
      onSort={(e, col) => {
        // Update the internal ordering state.
        setOrdering({ field: col.id });
        const updatedOrdering = applyOrderingUpdate(ordering, {
          field: col.id,
        });
        props.onSort?.(e, col, updatedOrdering);
      }}
    >
      <DataTableBody<D, I>
        isEmpty={isEmpty}
        emptyContent={emptyContent}
        data={data}
        ordering={ordering}
        columns={props.columns}
        rowHoveredClassName={rowHoveredClassName}
        numSkeletonRows={numSkeletonRows}
        highlightRowOnHover={highlightRowOnHover}
        rowHeight={rowHeight}
        isLoading={isLoading}
        loadingIndicator={loadingIndicator}
        skeletonRowHeight={skeletonRowHeight ?? rowHeight}
        actionMenuWidth={actionMenuWidth}
        onRowClick={onRowClick}
        getRowId={getRowId}
        getRowActions={getRowActions}
        onRowSelected={onRowSelected}
        rowIsSelected={rowIsSelected}
      />
    </DataTableWrapper>
  );
};
