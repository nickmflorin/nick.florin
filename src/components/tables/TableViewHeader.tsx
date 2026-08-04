import { type JSX } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface TableViewHeaderProps extends ComponentProps {
  readonly children?: JSX.Element;
  readonly controlBarTargetId?: null | string;
}

export const TableViewHeader = ({
  children,
  controlBarTargetId,
  ...props
}: TableViewHeaderProps): JSX.Element | null =>
  children || controlBarTargetId ? (
    <div {...props} className={classNames('table-view__header', props.className)}>
      {children}
      {controlBarTargetId ? <div id={controlBarTargetId} /> : null}
    </div>
  ) : controlBarTargetId ? (
    <div id={controlBarTargetId} />
  ) : null;
