import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface DescriptionGroupProps extends ComponentProps {
  readonly children: ReactNode;
}

export const DescriptionGroup = ({ children, ...props }: DescriptionGroupProps): JSX.Element => (
  <div {...props} className={clsx("flex flex-col gap-[8px]", props.className)}>
    {children}
  </div>
);
