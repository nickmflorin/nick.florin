import { type ReactNode } from "react";

import { classNames, type ComponentProps } from "~/components/types";

export interface DisabledProps extends ComponentProps {
  readonly isDisabled?: boolean;
  readonly children: ReactNode;
}

export const Disabled = ({ children, isDisabled, ...props }: DisabledProps) => (
  <div
    {...props}
    className={classNames({ "pointer-events-none opacity-25": isDisabled }, props.className)}
  >
    {children}
  </div>
);
