import { type ReactNode, forwardRef } from "react";

import clsx from "clsx";

import { type ComponentProps, type HTMLElementProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

import * as types from "./types";

export interface TooltipContentProps extends ComponentProps, HTMLElementProps<"div"> {
  readonly children: ReactNode;
  readonly variant?: types.FloatingVariant;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    { children, variant = types.FloatingVariants.SECONDARY, ...props }: TooltipContentProps,
    ref,
  ) => (
    <div
      {...props}
      ref={ref}
      className={clsx(
        types.getFloatingVariantClassName(variant),
        "z-50 rounded-sm py-[6px] px-[10px] text-md leading-[14px]",
        props.className,
      )}
    >
      {typeof children === "string" ? (
        <Text className="whitespace-nowrap">{children}</Text>
      ) : (
        children
      )}
    </div>
  ),
);
