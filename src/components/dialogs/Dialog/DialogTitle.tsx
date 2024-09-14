"use client";
import { forwardRef, useId, useLayoutEffect } from "react";

import { useDialogContext } from "~/components/dialogs/hooks/use-dialog-context";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography";

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
      <div {...props} ref={ref} className={classNames("dialog__title", props.className)}>
        {typeof children === "string" ? <Title component="h3">{children}</Title> : children}
      </div>
    );
  },
);
