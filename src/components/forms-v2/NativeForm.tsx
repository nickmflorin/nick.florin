import { type ReactNode } from "react";

import { type ComponentProps, classNames } from "~/components/types";

export type NativeFormProps = ComponentProps &
  Pick<React.ComponentProps<"form">, "action" | "onSubmit"> & {
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
