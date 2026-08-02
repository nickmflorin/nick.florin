'use client';
import { type JSX, type ReactNode } from 'react';

import { Portal } from '@mui/base/Portal';

export interface TableControlBarPortalProps {
  readonly children?: ReactNode;
  readonly targetId?: null | string;
}

export const TableControlBarPortal = ({
  children,
  targetId,
}: TableControlBarPortalProps): JSX.Element => {
  if (targetId) {
    /* The container is provided as a callback rather than as an element so that the lookup happens
       in the layout effect that the Portal already runs, at which point the target is mounted. */
    return <Portal container={() => document.getElementById(targetId)}>{children}</Portal>;
  }
  return <>{children}</>;
};
