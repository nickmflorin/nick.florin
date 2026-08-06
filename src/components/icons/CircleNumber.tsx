import { type JSX } from 'react';

import { clamp } from 'lodash-es';

import {
  classNames,
  type ComponentProps,
  inferQuantitativeSizeValue,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';
import { BaseTypography, type BaseTypographyProps } from '~/components/typography/BaseTypography';

export interface CircleNumberProps
  extends ComponentProps, Omit<BaseTypographyProps<'div'>, 'component' | 'lineHeight'> {
  readonly activeClassName?: ComponentProps['className'];
  readonly children: number | string;
  readonly inactiveClassName?: ComponentProps['className'];
  readonly isActive?: boolean;
  readonly size?: QuantitativeSize<'px'>;
}

export const CircleNumber = ({
  activeClassName,
  children,
  inactiveClassName,
  isActive = false,
  size = '24px',
  ...props
}: CircleNumberProps): JSX.Element => (
  <BaseTypography
    {...props}
    className={classNames(
      'flex items-center justify-center rounded-full p-[2px]',
      {
        [classNames('bg-blue-700 text-white', activeClassName)]: isActive,
        [classNames('bg-gray-300 text-body', inactiveClassName)]: !isActive,
      },
      props.className,
    )}
    component='div'
    style={{
      ...props.style,
      aspectRatio: '1/1',
      fontSize: '0.825rem',
      fontWeight: 700,
      height: sizeToString(clamp(inferQuantitativeSizeValue(size), 12, 64), 'px'),
      lineHeight: sizeToString(inferQuantitativeSizeValue(size) - 4, 'px'),
      width: sizeToString(clamp(inferQuantitativeSizeValue(size), 12, 64), 'px'),
    }}
  >
    {children}
  </BaseTypography>
);
