import { type ReactNode } from "react";

import clsx from "clsx";

import { sizeToString, type ComponentProps, type QuantitativeSize } from "~/components/types";

export interface ChartContainerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly maxHeight?: QuantitativeSize<"px">;
  readonly height?: QuantitativeSize<"px">;
  readonly minHeight?: QuantitativeSize<"px">;
}

export const ChartContainer = ({
  children,
  maxHeight,
  height,
  minHeight,
  ...props
}: ChartContainerProps): JSX.Element => (
  <div
    {...props}
    className={clsx("w-full relative", props.className)}
    style={{
      maxHeight: maxHeight ? sizeToString(maxHeight, "px") : undefined,
      minHeight: minHeight ? sizeToString(minHeight, "px") : undefined,
      height: height ? sizeToString(height, "px") : undefined,
    }}
  >
    {children}
  </div>
);
