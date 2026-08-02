import { type JSX, type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface PaperProps extends ComponentProps {
  readonly children: ReactNode;
}

export const Paper = ({ children, ...props }: PaperProps): JSX.Element => (
  <div {...props} className={classNames('paper', props.className)}>
    {children}
  </div>
);
