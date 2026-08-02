import { type JSX, type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface TableViewFooterProps extends ComponentProps {
  readonly children?: ReactNode;
}

export const TableViewFooter = ({
  children,
  ...props
}: TableViewFooterProps): JSX.Element | null =>
  children ? (
    <div {...props} className={classNames('table-view__footer', props.className)}>
      {children}
    </div>
  ) : null;
