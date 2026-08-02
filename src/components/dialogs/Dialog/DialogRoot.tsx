'use client';
import { type ReactNode } from 'react';

import { DialogContext } from '~/components/dialogs/context';
import { type DialogConfig, useDialog } from '~/components/dialogs/hooks/use-dialog';

export interface DialogRootProps extends DialogConfig {
  readonly children: ReactNode;
}

export const DialogRoot = ({ children, ...options }: DialogRootProps) => {
  const dialog = useDialog(options);
  return <DialogContext value={dialog}>{children}</DialogContext>;
};
