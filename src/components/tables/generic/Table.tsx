import { type TableSize, TableSizes } from "~/components/tables/types";
import type { ComponentProps } from "~/components/types";
import { classNames, parseDataAttributes } from "~/components/types";

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
    {...parseDataAttributes({ highlightRowsOnHover, bordered, size })}
    className={classNames("table", props.className)}
  >
    {children}
  </table>
);

export default Table;
