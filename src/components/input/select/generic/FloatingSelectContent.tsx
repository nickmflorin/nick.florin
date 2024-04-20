import React, { type ForwardedRef, forwardRef } from "react";

import clsx from "clsx";

import { FloatingContent } from "~/components/floating/FloatingContent";
import { type ComponentProps } from "~/components/types";

export interface FloatingSelectContentProps extends ComponentProps {
  readonly children: JSX.Element;
}

export const FloatingSelectContent = forwardRef<HTMLDivElement, FloatingSelectContentProps>(
  (
    { className, children, style }: FloatingSelectContentProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => (
    /* The style is needed for the FloatingContent to be positioned correctly with the Floating
       component's prop injection. */
    <FloatingContent variant="white" ref={ref} style={style} className={clsx("border", className)}>
      {children}
    </FloatingContent>
  ),
);
