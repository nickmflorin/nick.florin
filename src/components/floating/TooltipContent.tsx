import { forwardRef } from "react";

import clsx from "clsx";

import { Text } from "~/components/typography/Text";

import { PopoverContent, type FloatingContentProps } from "./PopoverContent";
import * as types from "./types";

export type TooltipContentProps = FloatingContentProps;

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  (
    {
      children,
      variant = types.PopoverVariants.SECONDARY,
      className = "py-[6px] px-[10px] text-md leading-[14px]",
      ...props
    }: TooltipContentProps,
    ref,
  ) => (
    <PopoverContent {...props} variant={variant} ref={ref} className={clsx(className)}>
      {typeof children === "string" ? (
        <Text inherit className="whitespace-nowrap">
          {children}
        </Text>
      ) : (
        children
      )}
    </PopoverContent>
  ),
);
