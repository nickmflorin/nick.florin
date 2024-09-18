import type { ReactNode } from "react";

import { classNames, type ComponentProps } from "~/components/types";

export interface HorizontallyCenteredProps extends ComponentProps {
  readonly children: ReactNode;
}

export const HorizontallyCentered = ({
  children,
  ...props
}: HorizontallyCenteredProps): JSX.Element => (
  <div
    {...props}
    className={classNames("flex flex-row justify-center items-center w-full", props.className)}
  >
    {children}
  </div>
);
