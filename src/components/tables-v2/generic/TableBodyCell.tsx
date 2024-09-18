import { type ReactNode } from "react";

import {
  classNames,
  type TextAlign,
  type ComponentProps,
  TextAlignClassNames,
} from "~/components/types";

export interface TableBodyCellProps
  extends ComponentProps,
    Omit<React.ComponentProps<"td">, keyof ComponentProps> {
  readonly children?: ReactNode;
  readonly align?: Extract<TextAlign, "left" | "center" | "right">;
}

export const TableBodyCell = ({ align, ...props }: TableBodyCellProps) => (
  <td
    {...props}
    className={classNames(
      "table__cell table__body-cell",
      align ? TextAlignClassNames[align] : "",
      props.className,
    )}
  />
);

export default TableBodyCell;
