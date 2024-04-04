"use client";
import { type ForwardedRef, forwardRef } from "react";

import { FloatingArrow, type FloatingContext } from "@floating-ui/react";
import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import * as types from "./types";

export interface ArrowProps extends Pick<ComponentProps, "className"> {
  readonly variant?: types.FloatingVariant;
  readonly context: FloatingContext;
}

export const Arrow = forwardRef(
  (
    { className, context, variant = types.FloatingVariants.SECONDARY }: ArrowProps,
    ref: ForwardedRef<SVGSVGElement>,
  ) => (
    <FloatingArrow
      ref={ref}
      context={context}
      height={4}
      width={9}
      className={clsx(types.getFloatingArrowVariantClassName(variant), className)}
    />
  ),
);
