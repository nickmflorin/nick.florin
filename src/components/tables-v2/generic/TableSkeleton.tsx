import React, { type ReactNode } from "react";

import { type TableBodyProps } from "~/components/tables-v2/generic/TableBody";
import type { QuantitativeSize } from "~/components/types";

import { TableBody } from "./TableBody";
import { TableBodyCell } from "./TableBodyCell";
import { TableBodyRow } from "./TableBodyRow";

interface BaseTableSkeletonProps {
  readonly numRows?: number;
  readonly cellSkeletons?: ReactNode[];
  readonly numColumns?: number;
  readonly rowHeight?: QuantitativeSize<"px">;
}

/* Note: We are not currently using this component, so we have a dummy
   '<div className="skeleton" />' as the skeleton for each cell - although the 'skeleton' class
   name and associated component is not yet built.  This was done so we can preemptively remove
   @mui from the application in its entirety - and since we are currently not using skeletons
   *anywhere*, this was a lazy stop-gap for now. */
const TableSkeletonInner = ({
  numRows = 25,
  cellSkeletons,
  numColumns = 5,
  rowHeight,
}: BaseTableSkeletonProps) => (
  <>
    {new Array(numRows).fill("").map((e, i) => (
      <TableBodyRow tabIndex={-1} key={i} height={rowHeight}>
        {(cellSkeletons ?? new Array(numColumns).fill(<div className="skeleton" />)).map(
          (skeleton, i) => (
            <TableBodyCell key={i}>{skeleton}</TableBodyCell>
          ),
        )}
      </TableBodyRow>
    ))}
  </>
);

export interface TableSkeletonBodyProps
  extends BaseTableSkeletonProps,
    Omit<TableBodyProps, "children"> {
  readonly component?: "tbody";
}

export interface TableSkeletonFragmentProps extends BaseTableSkeletonProps {
  readonly component: "fragment";
}

export type TableSkeletonProps = TableSkeletonBodyProps | TableSkeletonFragmentProps;

export const TableSkeleton = ({
  cellSkeletons,
  numRows = 25,
  rowHeight,
  numColumns,
  component,
  ...props
}: TableSkeletonProps) =>
  component === "tbody" ? (
    <TableBody {...props}>
      <TableSkeletonInner
        cellSkeletons={cellSkeletons}
        numColumns={numColumns}
        numRows={numRows}
        rowHeight={rowHeight}
      />
    </TableBody>
  ) : (
    <TableSkeletonInner
      cellSkeletons={cellSkeletons}
      numColumns={numColumns}
      numRows={numRows}
      rowHeight={rowHeight}
    />
  );
