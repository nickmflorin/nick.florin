import { type ReactNode } from "react";

import {
  classNames,
  type HorizontalFlexAlign,
  type ComponentProps,
  HorizontalFlexAlignClassNames,
} from "~/components/types";

export interface TableBodyCellProps
  extends ComponentProps,
    Omit<React.ComponentProps<"td">, keyof ComponentProps> {
  readonly children?: ReactNode;
  readonly align?: HorizontalFlexAlign;
}

export const TableBodyCell = ({ align, ...props }: TableBodyCellProps) => (
  <td {...props} className={classNames("table__cell table__body-cell", props.className)}>
    <div
      className={classNames(
        "table__body-cell__inner",
        align ? HorizontalFlexAlignClassNames[align] : "",
      )}
    >
      {props.children}
    </div>
  </td>
);

export default TableBodyCell;
