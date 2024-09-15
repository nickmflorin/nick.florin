import { type ReactNode } from "react";

import { type ComponentProps, type QuantitativeSize, classNames } from "~/components/types";

export interface DrawerContainerProps extends ComponentProps {
  readonly children: ReactNode;
  readonly width: QuantitativeSize<"px">;
}

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export const DrawerContainer = ({ children, width, ...props }: DrawerContainerProps) => (
  <div
    {...props}
    className={classNames("drawer-container", props.className)}
    style={{
      ...props.style,
      // This messes with the full size view on mobile - we will revisit later.
      /* width: sizeToString(width, "px"),
         maxWidth: sizeToString(width, "px"),
         minWidth: sizeToString(width, "px"), */
    }}
  >
    {children}
  </div>
);
