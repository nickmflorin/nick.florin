import { type ReactNode } from 'react';

import {
  classNames,
  type ComponentProps,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

export interface ContentProps extends ComponentProps {
  readonly children: ReactNode;
  readonly isScrollable?: boolean;
  readonly outerClassName?: ComponentProps['className'];
  readonly padding?: QuantitativeSize<'px'>;
}

export const Content = ({
  children,
  isScrollable,
  outerClassName,
  padding,
  ...props
}: ContentProps) => (
  <div
    className={classNames(
      'content',
      {
        'overflow-y-auto': isScrollable,
        'overflow-y-hidden': isScrollable === false,
      },
      outerClassName,
    )}
  >
    <div
      {...props}
      className={classNames('content__scroll-viewport', props.className)}
      style={{
        ...props.style,
        paddingBottom: padding ? sizeToString(padding, 'px') : props.style?.paddingBottom,
        paddingTop: padding ? sizeToString(padding, 'px') : props.style?.paddingTop,
      }}
    >
      {children}
    </div>
  </div>
);
