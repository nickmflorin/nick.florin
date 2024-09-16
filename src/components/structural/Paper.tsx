import type { ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface PaperProps extends ComponentProps {
  readonly children: ReactNode;
}

export const Paper = ({ children, ...props }: PaperProps): JSX.Element => (
  <div {...props} className={classNames("paper", props.className)}>
    {children}
  </div>
);
