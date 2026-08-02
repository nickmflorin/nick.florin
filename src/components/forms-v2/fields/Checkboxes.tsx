import { type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';
import { type QuantitativeSize, sizeToString } from '~/components/types/sizes';

export interface CheckboxesProps extends ComponentProps {
  readonly children: ReactNode;
  readonly gap?: QuantitativeSize<'px'>;
  readonly hasOuterMargin?: boolean;
  readonly orientation?: 'horizontal' | 'vertical';
}

export const Checkboxes = ({
  children,
  gap = '16px',
  hasOuterMargin = false,
  orientation = 'horizontal',
  ...props
}: CheckboxesProps) => (
  <div
    {...props}
    className={classNames('flex', {
      'flex-col': orientation === 'vertical',
      'flex-row': orientation === 'horizontal',
      'mt-[6px]': hasOuterMargin,
    })}
    style={{ gap: sizeToString(gap, 'px') }}
  >
    {children}
  </div>
);
