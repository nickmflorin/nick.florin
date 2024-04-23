"use client";
import { forwardRef, useId, useLayoutEffect } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

import { useDialogContext } from "../hooks/use-dialog-context";

export interface DialogTitleProps
  extends ComponentProps,
    Omit<React.HTMLProps<HTMLDivElement>, keyof ComponentProps> {
  readonly children?: JSX.Element | string;
}

export const DialogTitle = forwardRef<HTMLDivElement, DialogTitleProps>(
  ({ children, ...props }, ref) => {
    const { setTitleId } = useDialogContext();
    const id = useId();

    /* Only set 'aria-labeledby' on the Dialog root element if this component is mounted inside of
       it. */
    useLayoutEffect(() => {
      setTitleId(id);
      return () => setTitleId(undefined);
    }, [id, setTitleId]);

    return (
      <div {...props} ref={ref} className={clsx("dialog__title", props.className)}>
        {typeof children === "string" ? <Title order={3}>{children}</Title> : children}
      </div>
    );
  },
);
