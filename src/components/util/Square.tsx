import { type JSX, type ReactNode } from 'react';

import {
  classNames,
  type ComponentProps,
  type QuantitativeSize,
  sizeToString,
} from '~/components/types';

export interface SquareProps extends ComponentProps {
  readonly areChildrenContained?: boolean;
  readonly children: ReactNode;
  readonly size?: QuantitativeSize<'px'>;
}

export const Square = ({
  areChildrenContained,
  children,
  size,
  ...props
}: SquareProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      'flex flex-col h-full w-auto aspect-square justify-center items-center',
      { '[&>*]:max-h-full [&>*]:max-w-full': areChildrenContained },
      props.className,
    )}
    style={{
      ...props.style,
      height: size ? sizeToString(size, 'px') : props.style?.height,
      width: size ? sizeToString(size, 'px') : props.style?.width,
    }}
  >
    {children}
  </div>
);
