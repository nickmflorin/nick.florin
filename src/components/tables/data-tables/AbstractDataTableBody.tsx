import React, { useMemo } from "react";

import { type FloatingContentRenderProps } from "~/components/floating";
import { type ActionsCellProps } from "~/components/tables/cells/ActionsCell";
import type { TableBodyProps } from "~/components/tables/generic/TableBody";
import { TableBody } from "~/components/tables/generic/TableBody";
import * as types from "~/components/tables/types";
import { type ClassName, type QuantitativeSize } from "~/components/types";

import { type DataTableBodyRowProps } from "./DataTableBodyRow";

export interface AbstractDataTableBodyProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<TableBodyProps, "cellSkeletons" | "numSkeletonColumns" | "children"> {
  readonly data: D[];
  readonly columns: C[];
  readonly columnProperties: types.DataTableColumnProperties<D, C>;
  readonly excludeColumns?: types.TableColumnId<C>[];
  readonly rowHoveredClassName?: ClassName;
  readonly highlightRowOnHover?: boolean;
  readonly scrollable?: boolean;
  readonly rowHeight?: QuantitativeSize<"px">;
  readonly actionMenuWidth?: ActionsCellProps["menuWidth"];
  readonly children: (
    props: Omit<DataTableBodyRowProps<D, C>, "rowIsSelected" | "onRowSelected">,
  ) => JSX.Element;
  readonly onRowClick?: (id: string, datum: D) => void;
  readonly getRowActions?: (
    datum: D,
    params: Pick<FloatingContentRenderProps, "setIsOpen">,
  ) => types.DataTableRowAction[];
}

export const AbstractDataTableBody = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  data,
  rowHoveredClassName,
  highlightRowOnHover,
  rowHeight,
  columns: _columns,
  columnProperties,
  actionMenuWidth,
  excludeColumns = [],
  children,
  onRowClick,
  getRowActions,
  ...props
}: AbstractDataTableBodyProps<D, C>): JSX.Element => {
  const columns = useMemo(
    () => types.convertConfigsToColumns(_columns, columnProperties),
    [_columns, columnProperties],
  );
  return (
    <TableBody
      {...props}
      skeletonRowHeight={props.skeletonRowHeight ?? rowHeight}
      /* Note: We are not currently using this component, so we have a dummy
         '<div className="skeleton" />' as the skeleton for each cell - although the 'skeleton'
         class name and associated component is not yet built.  This was done so we can preemptively
         remove @mui from the application in its entirety - and since we are currently not using
         skeletons *anywhere*, this was a lazy stop-gap for now. */
      cellSkeletons={columns.map(
        ({ config: { skeleton } }, i) => skeleton ?? <div key={i} className="skeleton" />,
      )}
    >
      {data.map(datum => (
        <React.Fragment key={datum.id}>
          {children({
            datum,
            columns,
            height: rowHeight,
            hoveredClassName: rowHoveredClassName,
            highlightOnHover: highlightRowOnHover,
            actionMenuWidth,
            excludeColumns,
            onClick: () => onRowClick?.(datum.id, datum),
            getRowActions,
          })}
        </React.Fragment>
      ))}
    </TableBody>
  );
};
