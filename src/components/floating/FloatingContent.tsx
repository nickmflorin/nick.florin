import { type ReactNode, forwardRef } from "react";

import clsx from "clsx";

import {
  type HTMLElementProps,
  type ComponentProps,
  type Size,
  sizeToString,
} from "~/components/types";
import { classNameContains } from "~/components/types";

import * as types from "./types";

export interface FloatingContentProps extends ComponentProps, HTMLElementProps<"div"> {
  readonly children: ReactNode;
  readonly variant?: types.FloatingVariant;
  readonly maxHeight?: Size | null;
}

export const FloatingContent = forwardRef<HTMLDivElement, FloatingContentProps>(
  (
    {
      children,
      className = "rounded-sm",
      variant = types.FloatingVariants.PRIMARY,
      maxHeight,
      ...props
    }: FloatingContentProps,
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={clsx(types.getFloatingVariantClassName(variant, className), "z-50", {
        "rounded-sm": !classNameContains(className, v => v.startsWith("rounded-")),
      })}
      style={maxHeight ? { ...props.style, maxHeight: sizeToString(maxHeight) } : props.style}
    >
      {children}
    </div>
  ),
);
