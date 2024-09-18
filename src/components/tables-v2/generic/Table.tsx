import { type TableSize } from "~/components/tables-v2/types";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

export interface TableProps
  extends ComponentProps,
    Omit<React.ComponentProps<"table">, keyof ComponentProps> {
  readonly size?: TableSize;
  readonly bordered?: boolean;
  readonly highlightRowsOnHover?: boolean;
}

export const Table = ({
  children,
  highlightRowsOnHover = true,
  bordered = true,
  size = "medium",
  ...props
}: TableProps) => (
  <table
    {...props}
    className={classNames(
      "table-v2",
      `table--size-${size}`,
      {
        "table--higlighted-rows-on-hover": highlightRowsOnHover,
        "table--bordered": bordered,
      },
      props.className,
    )}
  >
    {children}
  </table>
);

export default Table;
