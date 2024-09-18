import { classNames } from "~/components/types";
import { type ClassName } from "~/components/types";

import { AbstractTableRow, type AbstractTableRowProps } from "./AbstractTableRow";

export interface TableHeaderRowProps extends AbstractTableRowProps {
  readonly hoveredClassName?: ClassName;
  readonly highlightOnHover?: boolean;
}

export const TableHeaderRow = (props: TableHeaderRowProps) => (
  <AbstractTableRow {...props} className={classNames("table__header-row", props.className)} />
);

export default TableHeaderRow;
