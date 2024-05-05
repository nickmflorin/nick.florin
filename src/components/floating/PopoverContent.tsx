import { type ReactNode, forwardRef } from "react";

import clsx from "clsx";

import { type HTMLElementProps, type ComponentProps } from "~/components/types";
import { classNameContains } from "~/components/types";
import { type Size, sizeToString } from "~/components/types/sizes";

import * as types from "./types";

export interface FloatingContentProps extends ComponentProps, HTMLElementProps<"div"> {
  readonly children: ReactNode;
  readonly variant?: types.PopoverVariant;
  readonly maxHeight?: Size | null;
}

export const PopoverContent = forwardRef<HTMLDivElement, FloatingContentProps>(
  (
    {
      children,
      className = "rounded-sm",
      variant = types.PopoverVariants.PRIMARY,
      maxHeight,
      ...props
    }: FloatingContentProps,
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={clsx(
        /* Note: We need to use the 'floating-content' class so that we can set the 'max-height'
           of any potentially underlying Menu to the same max height that is set on the outer
           PopoverContent element. */
        "floating-content",
        types.getPopoverVariantClassName(variant, className),
        "z-50",
        { "rounded-sm": !classNameContains(className, v => v.prefix.startsWith("rounded-")) },
      )}
      style={{
        ...props.style,
        maxHeight: maxHeight ? sizeToString(maxHeight, "px") : props.style?.maxHeight,
      }}
    >
      {children}
    </div>
  ),
);
