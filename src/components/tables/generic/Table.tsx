import { type TableSize, TableSizes } from "~/components/tables/types";
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
  size = TableSizes.SMALL,
  ...props
}: TableProps) => (
  <table
    {...props}
    className={classNames(
      "table-v2",
      `table-v2--size-${size}`,
      {
        "table-v2--higlighted-rows-on-hover": highlightRowsOnHover,
        "table-v2--bordered": bordered,
      },
      props.className,
    )}
  >
    {children}
  </table>
);

export default Table;
