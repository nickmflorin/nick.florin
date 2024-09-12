import { type ReactNode, forwardRef } from "react";

import {
  type HTMLElementProps,
  type ComponentProps,
  type Size,
  sizeToString,
} from "~/components/types";
import { classNames } from "~/components/types";

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
      variant = types.PopoverVariants.PRIMARY,
      maxHeight,
      ...props
    }: FloatingContentProps,
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={classNames(
        /* Note: We need to use the 'floating-content' class so that we can set the 'max-height'
           of any potentially underlying Menu to the same max height that is set on the outer
           PopoverContent element. */
        "floating-content",
        types.getPopoverVariantClassName(variant),
        "z-50 rounded-sm",
        props.className,
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
