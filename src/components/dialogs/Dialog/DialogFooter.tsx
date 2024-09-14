"use client";
import { forwardRef, type ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface DialogFooterProps
  extends ComponentProps,
    Omit<React.HTMLProps<HTMLDivElement>, keyof ComponentProps> {
  readonly children?: ReactNode;
}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ children, ...props }, ref) => (
    <div {...props} ref={ref} className={classNames("dialog__footer", props.className)}>
      {children}
    </div>
  ),
);
