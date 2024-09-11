"use client";
import { type ForwardedRef, forwardRef } from "react";

import { FloatingArrow, type FloatingContext } from "@floating-ui/react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import * as types from "./types";

export interface ArrowProps extends Pick<ComponentProps, "className"> {
  readonly variant?: types.PopoverVariant;
  readonly context: FloatingContext;
}

export const Arrow = forwardRef(
  (
    { className, context, variant = types.PopoverVariants.SECONDARY }: ArrowProps,
    ref: ForwardedRef<SVGSVGElement>,
  ) => (
    <FloatingArrow
      ref={ref}
      context={context}
      height={4}
      width={9}
      className={classNames(types.getPopoverArrowVariantClassName(variant), className)}
    />
  ),
);

export default Arrow;
