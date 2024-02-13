import { type ReactNode, forwardRef } from "react";

import clsx from "clsx";

import { type HTMLElementProps, type ComponentProps } from "~/components/types";

import * as types from "./types";

export interface FloatingContentProps extends ComponentProps, HTMLElementProps<"div"> {
  readonly children: ReactNode;
  readonly variant?: types.FloatingVariant;
}

export const FloatingContent = forwardRef<HTMLDivElement, FloatingContentProps>(
  ({ children, variant = types.FloatingVariants.PRIMARY, ...props }: FloatingContentProps, ref) => (
    <div
      {...props}
      ref={ref}
      className={clsx(types.getFloatingVariantClassName(variant), "z-50", props.className)}
    >
      {children}
    </div>
  ),
);
