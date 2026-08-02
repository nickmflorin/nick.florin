import { type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface ModuleContentProps extends ComponentProps {
  readonly children: ReactNode;
  readonly isScrollable?: boolean;
}

export const ModuleContent = ({ children, isScrollable = false, ...props }: ModuleContentProps) => (
  <div
    {...props}
    className={classNames(
      'module__content',
      { 'overflow-y-auto pr-[16px]': isScrollable },
      props.className,
    )}
  >
    {children}
  </div>
);
