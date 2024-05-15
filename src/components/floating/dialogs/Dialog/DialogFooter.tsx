"use client";
import { forwardRef, type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface DialogFooterProps
  extends ComponentProps,
    Omit<React.HTMLProps<HTMLDivElement>, keyof ComponentProps> {
  readonly children?: ReactNode;
}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, ...props }, ref) => (
    <div {...props} ref={ref} className={clsx("dialog__footer", props.className)}>
      {children}
    </div>
  ),
);
