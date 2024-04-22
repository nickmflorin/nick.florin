import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface ChartContainerProps extends ComponentProps {
  readonly children: ReactNode;
}

export const ChartContainer = ({ children, ...props }: ChartContainerProps): JSX.Element => (
  <div {...props} className={clsx("w-full relative", props.className)}>
    {children}
  </div>
);
