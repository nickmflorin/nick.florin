import { type ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps, type HTMLElementProps } from "~/components/types";

export type NativeFormProps = ComponentProps &
  Pick<HTMLElementProps<"form">, "action" | "onSubmit"> & {
    readonly children: ReactNode;
  };

export const NativeForm = ({ children, ...props }: NativeFormProps): JSX.Element => (
  <form
    {...props}
    className={classNames(props.className)}
    onSubmit={
      /* Do not use the onSubmit handler unless it is defined.  Forcing the event to
         preventDefault() will cause the server actions on a Form to not be called. */
      props.onSubmit !== undefined
        ? e => {
            e.preventDefault();
            props.onSubmit?.(e);
          }
        : undefined
    }
  >
    {children}
  </form>
);
