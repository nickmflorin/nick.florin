import { type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface MultiValueRendererContainerProps extends ComponentProps {
  readonly children: ReactNode;
  /**
   * Whether the container may grow in height to wrap its children onto additional rows.
   *
   * When false, the Select input shows only one row of badges or text, and content that would
   * exceed the width of the Select truncates with ellipsis overflow instead of causing the Select
   * to expand in height.
   *
   * @default true
   */
  readonly hasDynamicHeight?: boolean;
}

export const MultiValueRendererContainer = ({
  children,
  hasDynamicHeight = true,
  ...props
}: MultiValueRendererContainerProps) => (
  <div
    {...props}
    className={classNames(
      'flex gap-x-[4px] overflow-hidden',
      {
        'flex-row': !hasDynamicHeight,
        'flex-wrap gap-y-[4px]': hasDynamicHeight,
      },
      props.className,
    )}
  >
    {children}
  </div>
);
