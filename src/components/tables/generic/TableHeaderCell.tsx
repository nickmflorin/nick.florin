import { type MouseEvent, type ReactNode } from 'react';

import { type Order } from '~/lib/ordering';

import { type IconName, type IconProp } from '~/components/icons';
import { SortIcon } from '~/components/icons/SortIcon';
import {
  classNames,
  type ComponentProps,
  type HorizontalFlexAlign,
  HorizontalFlexAlignClassNames,
  parseDataAttributes,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

export interface TableHeaderCellProps extends ComponentProps {
  readonly align?: HorizontalFlexAlign;
  readonly children?: ReactNode;
  readonly icon?: IconName | IconProp;
  readonly isOrderable?: boolean;
  readonly isOrdered?: boolean;
  readonly maxWidth?: QuantitativeSize<'px'>;
  readonly minWidth?: QuantitativeSize<'px'>;
  readonly onClick?: (e: MouseEvent<HTMLTableHeaderCellElement>) => void;
  readonly onSort?: (event: MouseEvent<HTMLTableHeaderCellElement>) => void;
  readonly order?: null | Order;
  readonly width?: QuantitativeSize<'px'>;
}

export const TableHeaderCell = ({
  align,
  children,
  icon,
  isOrderable = false,
  isOrdered,
  maxWidth,
  minWidth,
  onClick,
  onSort,
  order,
  width,
  ...props
}: TableHeaderCellProps) => (
  <th
    {...props}
    {...parseDataAttributes({ isOrdered })}
    className={classNames(
      'table__cell table__header-cell',
      {
        'pointer-events-auto cursor-pointer':
          onClick !== undefined || (isOrderable && order !== undefined),
      },
      align ? HorizontalFlexAlignClassNames[align] : '',
      props.className,
    )}
    onClick={e => {
      onClick?.(e);
      onSort?.(e);
    }}
    style={{
      ...props.style,
      maxWidth: maxWidth ? sizeToString(maxWidth, 'px') : props.style?.maxWidth,
      minWidth: minWidth ? sizeToString(minWidth, 'px') : props.style?.minWidth,
      width: width ? sizeToString(width, 'px') : props.style?.width,
    }}
  >
    {isOrderable && order !== undefined ? (
      <div
        className={classNames(
          'table__header-cell__inner gap-3',
          align ? HorizontalFlexAlignClassNames[align] : '',
        )}
      >
        {align === 'right' ? (
          <>
            <SortIcon
              className='table__header-cell__sort-icon'
              icon={icon}
              order={order ?? 'asc'}
              size='14px'
            />
            {children}
          </>
        ) : (
          <>
            {children}
            <SortIcon
              className='table__header-cell__sort-icon'
              icon={icon}
              order={order ?? 'asc'}
              size='14px'
            />
          </>
        )}
      </div>
    ) : (
      <div
        className={classNames(
          'table__header-cell__inner',
          align ? HorizontalFlexAlignClassNames[align] : '',
        )}
      >
        {children}
      </div>
    )}
  </th>
);
