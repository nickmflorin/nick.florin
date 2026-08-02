import { type ComponentProps as ReactComponentProps } from 'react';

import { type TableSize, TableSizes } from '~/components/tables/types';
import { classNames, type ComponentProps, parseDataAttributes } from '~/components/types';

export interface TableProps
  extends ComponentProps, Omit<ReactComponentProps<'table'>, keyof ComponentProps> {
  readonly isBordered?: boolean;
  readonly shouldHighlightRowsOnHover?: boolean;
  readonly size?: TableSize;
}

export const Table = ({
  children,
  isBordered = true,
  shouldHighlightRowsOnHover = true,
  size = TableSizes.SMALL,
  ...props
}: TableProps) => (
  <table
    {...props}
    {...parseDataAttributes({
      bordered: isBordered,
      highlightRowsOnHover: shouldHighlightRowsOnHover,
      size,
    })}
    className={classNames('table', props.className)}
  >
    {children}
  </table>
);
