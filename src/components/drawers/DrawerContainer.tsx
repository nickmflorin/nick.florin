import { type ReactNode } from "react";

import {
  type ComponentProps,
  type QuantitativeSize,
  classNames,
  sizeToString,
} from "~/components/types";

export interface DrawerContainerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly width: QuantitativeSize<"px">;
}

export const DrawerContainer = ({ children, width, ...props }: DrawerContainerProps) => (
  <div
    {...props}
    className={classNames("drawer-container", props.className)}
    style={{
      ...props.style,
      width: sizeToString(width, "px"),
      maxWidth: sizeToString(width, "px"),
      minWidth: sizeToString(width, "px"),
    }}
  >
    {children}
  </div>
);
