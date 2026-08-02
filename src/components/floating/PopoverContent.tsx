import { type ComponentProps as ReactComponentProps, type ReactNode } from 'react';

import { Loading } from '~/components/loading/Loading';
import { classNames, type ComponentProps } from '~/components/types';
import { type QuantitativeSize, sizeToString } from '~/components/types/sizes';

export interface PopoverContentProps
  extends ComponentProps, Omit<ReactComponentProps<'div'>, keyof ComponentProps> {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
  readonly maxHeight?: null | QuantitativeSize<'px'>;
}

export const PopoverContent = ({
  children,
  className,
  isLoading,
  maxHeight,
  ref,
  ...props
}: PopoverContentProps) => (
  <div
    {...props}
    className={classNames('popover-content', className)}
    data-attr-loading={isLoading}
    ref={ref}
    style={{
      ...props.style,
      maxHeight: maxHeight ? sizeToString(maxHeight, 'px') : props.style?.maxHeight,
    }}
  >
    <Loading isLoading={isLoading} position='fixed'>
      {children}
    </Loading>
  </div>
);
