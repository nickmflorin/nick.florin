'use client';
import { type HTMLProps, type ReactNode } from 'react';

import { classNames, type ComponentProps } from '~/components/types';

export interface DialogFooterProps
  extends ComponentProps, Omit<HTMLProps<HTMLDivElement>, keyof ComponentProps> {
  readonly children?: ReactNode;
}

export const DialogFooter = ({ children, ref, ...props }: DialogFooterProps) => (
  <div {...props} className={classNames('dialog__footer', props.className)} ref={ref}>
    {children}
  </div>
);
