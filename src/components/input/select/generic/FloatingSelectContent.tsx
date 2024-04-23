import React, { type ForwardedRef, forwardRef } from "react";

import clsx from "clsx";

import { PopoverContent } from "~/components/floating/PopoverContent";
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
    <PopoverContent variant="white" ref={ref} style={style} className={clsx("border", className)}>
      {children}
    </PopoverContent>
  ),
);
