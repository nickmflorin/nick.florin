"use client";
import { type ForwardedRef, forwardRef } from "react";

import { FloatingArrow, type FloatingContext } from "@floating-ui/react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface ArrowProps extends Pick<ComponentProps, "className"> {
  readonly context: FloatingContext;
}

export const Arrow = forwardRef(
  ({ className, context }: ArrowProps, ref: ForwardedRef<SVGSVGElement>) => (
    <FloatingArrow
      ref={ref}
      context={context}
      height={4}
      width={9}
      className={classNames(
        "fill-white",
        "[&>path:first-of-type]:stroke-white",
        "[&>path:last-of-type]:stroke-white",
        className,
      )}
    />
  ),
);

export default Arrow;
