import { type ReactNode, forwardRef } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface DescriptionGroupProps extends ComponentProps {
  readonly children: ReactNode;
}

export const DescriptionGroup = forwardRef<HTMLDivElement, DescriptionGroupProps>(
  ({ children, ...props }, ref): JSX.Element => (
    <div {...props} ref={ref} className={classNames("flex flex-col gap-[8px]", props.className)}>
      {children}
    </div>
  ),
);
