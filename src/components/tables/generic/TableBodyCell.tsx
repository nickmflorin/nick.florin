import { type ComponentProps as ReactComponentProps, type ReactNode } from 'react';

import {
  classNames,
  type ComponentProps,
  type HorizontalFlexAlign,
  HorizontalFlexAlignClassNames,
} from '~/components/types';

export interface TableBodyCellProps
  extends ComponentProps, Omit<ReactComponentProps<'td'>, keyof ComponentProps> {
  readonly align?: HorizontalFlexAlign;
  readonly children?: ReactNode;
}

export const TableBodyCell = ({ align, ...props }: TableBodyCellProps) => (
  <td {...props} className={classNames('table__cell table__body-cell', props.className)}>
    <div
      className={classNames(
        'table__body-cell__inner',
        align ? HorizontalFlexAlignClassNames[align] : '',
      )}
    >
      {props.children}
    </div>
  </td>
);
