"use client";
import { forwardRef, useId, useLayoutEffect, type ReactNode } from "react";

import { useDialogContext } from "~/components/dialogs/hooks/use-dialog-context";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import { DialogDescription } from "./DialogDescription";

export interface DialogContentProps
  extends ComponentProps,
    Omit<React.HTMLProps<HTMLDivElement>, keyof ComponentProps> {
  readonly children?: ReactNode;
}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, ...props }, ref) => {
    const { setContentId } = useDialogContext();
    const id = useId();

    /* Only set 'aria-labeledby' on the Dialog root element if this component is mounted inside of
       it. */
    useLayoutEffect(() => {
      setContentId(id);
      return () => setContentId(undefined);
    }, [id, setContentId]);

    return (
      <div {...props} ref={ref} className={classNames("dialog__content", props.className)}>
        {typeof children === "string" ? (
          <DialogDescription>{children}</DialogDescription>
        ) : (
          children
        )}
      </div>
    );
  },
);
