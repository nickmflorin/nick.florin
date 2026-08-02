import { type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface DrawerContainerProps extends ComponentProps {
  readonly children: ReactNode;
}

export const DrawerContainer = ({ children, ...props }: DrawerContainerProps) => (
  <div {...props} className={classNames('drawer-container', props.className)}>
    {children}
  </div>
);
