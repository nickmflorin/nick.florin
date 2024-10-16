"use client";
import type { ReactNode } from "react";

import { DialogContext } from "~/components/dialogs/context";
import { useDialog, type DialogConfig } from "~/components/dialogs/hooks/use-dialog";

export interface DialogProviderProps extends DialogConfig {
  readonly children: ReactNode;
}

export const DialogProvider = ({ children, ...options }: DialogProviderProps) => {
  const dialog = useDialog(options);
  return <DialogContext.Provider value={dialog}>{children}</DialogContext.Provider>;
};

export default DialogProvider;
