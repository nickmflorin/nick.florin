import { type ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface DescriptionGroupProps extends ComponentProps {
  readonly children: ReactNode;
}

export const DescriptionGroup = ({ children, ...props }: DescriptionGroupProps): JSX.Element => (
  <div {...props} className={classNames("flex flex-col gap-[8px]", props.className)}>
    {children}
  </div>
);
