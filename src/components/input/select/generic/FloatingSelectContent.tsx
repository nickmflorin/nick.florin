import React, { type ForwardedRef, forwardRef } from "react";

import { PopoverContent } from "~/components/floating/PopoverContent";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface FloatingSelectContentProps extends ComponentProps {
  readonly children: JSX.Element;
}

export const FloatingSelectContent = forwardRef<HTMLDivElement, FloatingSelectContentProps>(
  (
    { className, children, style }: FloatingSelectContentProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => (
    /* The style is needed for the PopoverContent to be positioned correctly with the Popover
       component's prop injection. */
    <PopoverContent
      variant="white"
      ref={ref}
      style={style}
      className={classNames("border", className)}
    >
      {children}
    </PopoverContent>
  ),
);
