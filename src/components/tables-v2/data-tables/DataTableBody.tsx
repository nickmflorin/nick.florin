import { useMemo } from "react";

import { logger } from "~/internal/logger";
import { type Ordering } from "~/lib/ordering";

import { type FloatingContentRenderProps } from "~/components/floating";
import { type ActionsCellProps } from "~/components/tables-v2/cells/ActionsCell";
import type { TableBodyProps } from "~/components/tables-v2/generic/TableBody";
import { TableBody } from "~/components/tables-v2/generic/TableBody";
import type * as types from "~/components/tables-v2/types";
import { type ClassName, type QuantitativeSize } from "~/components/types";

import { DataTableBodyRow } from "./DataTableBodyRow";
import { getDatumId } from "./util";

export interface DataTableBodyProps<D extends types.DataTableDatum, I extends string = string>
  extends Omit<TableBodyProps, "cellSkeletons" | "numSkeletonColumns" | "children"> {
  readonly data: D[];
  readonly columns: types.DataTableColumn<D, I>[];
  readonly excludeColumns?: I[];
  readonly ordering?: Ordering<I> | null;
  readonly rowHoveredClassName?: ClassName;
  readonly highlightRowOnHover?: boolean;
  readonly scrollable?: boolean;
  readonly rowHeight?: QuantitativeSize<"px">;
  readonly actionMenuWidth?: ActionsCellProps["menuWidth"];
  readonly getRowId?: (datum: D) => string;
  readonly onRowClick?: (id: string, datum: D) => void;
  readonly rowIsSelected?: (datum: D) => boolean;
  readonly onRowSelected?: (datum: D, isSelected: boolean) => void;
  readonly getRowActions?: (
    datum: D,
    params: Pick<FloatingContentRenderProps, "setIsOpen">,
  ) => types.DataTableRowAction[];
}

export const DataTableBody = <D extends types.DataTableDatum, I extends string>({
  data,
  rowHoveredClassName,
  highlightRowOnHover,
  rowHeight,
  columns,
  ordering,
  actionMenuWidth,
  excludeColumns = [],
  rowIsSelected,
  onRowSelected,
  getRowId,
  onRowClick,
  getRowActions,
  ...props
}: DataTableBodyProps<D, I>): JSX.Element => {
  const processedData = useMemo(() => {
    if (ordering) {
      const col = columns.find(c => c.id === ordering.orderBy);
      if (col == undefined) {
        logger.error(
          `Suspicious State: Cannot order data by field '${ordering.orderBy}' because an associated ` +
            "column with that id does not exist!",
        );
        return data;
      }
      const sortMethod = col.config.sortMethod;
      if (sortMethod) {
        return data.sort((a, b) => sortMethod(ordering.order, a, b));
      }
    }
    return data;
  }, [data, ordering, columns]);

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
      {processedData.map((datum, index) => {
        const rowId = getDatumId(datum, { index, getRowId });
        return (
          <DataTableBodyRow<D, I>
            datum={datum}
            columns={columns}
            key={rowId}
            height={rowHeight}
            hoveredClassName={rowHoveredClassName}
            highlightOnHover={highlightRowOnHover}
            actionMenuWidth={actionMenuWidth}
            excludeColumns={excludeColumns}
            onClick={() => onRowClick?.(rowId, datum)}
            getRowActions={getRowActions}
            rowIsSelected={rowIsSelected}
            onRowSelected={onRowSelected}
          />
        );
      })}
    </TableBody>
  );
};
