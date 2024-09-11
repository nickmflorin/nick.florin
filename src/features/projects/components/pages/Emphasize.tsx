import { type ReactNode } from "react";

import { classNames, type ComponentProps } from "~/components/types";

export interface EmphasizeProps extends ComponentProps {
  readonly children: ReactNode;
}

const LocalEmphasize = ({ children, ...props }: EmphasizeProps): JSX.Element => (
  <span {...props} className={classNames("font-medium text-text", props.className)}>
    {children}
  </span>
);

export const Emphasize = Object.assign(LocalEmphasize, {
  Caption: ({ children, ...props }: EmphasizeProps): JSX.Element => (
    <LocalEmphasize {...props} className={classNames("text-[#7f7f7f]", props.className)}>
      {children}
    </LocalEmphasize>
  ),
});
