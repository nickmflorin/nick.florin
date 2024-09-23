import type { ReactNode } from "react";

import type { ComponentProps, QuantitativeSize } from "~/components/types";
import { classNames, sizeToString } from "~/components/types";

export interface SquareProps extends ComponentProps {
  readonly size?: QuantitativeSize<"px">;
  readonly children: ReactNode;
}

export const Square = ({ size, children, ...props }: SquareProps): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "flex flex-col h-full w-auto aspect-square justify-center items-center",
      props.className,
    )}
    style={{
      ...props.style,
      width: size ? sizeToString(size, "px") : props.style?.width,
      height: size ? sizeToString(size, "px") : props.style?.height,
    }}
  >
    {children}
  </div>
);
