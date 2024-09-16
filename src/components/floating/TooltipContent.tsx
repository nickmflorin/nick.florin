import { forwardRef } from "react";

import { classNames } from "~/components/types";
import { Text } from "~/components/typography/Text";

import { PopoverContent, type PopoverContentProps } from "./PopoverContent";

export type TooltipContentProps = PopoverContentProps;

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ children, ...props }: TooltipContentProps, ref) => (
    <PopoverContent {...props} ref={ref} className={classNames("tooltip-content", props.className)}>
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
