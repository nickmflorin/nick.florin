import React, { type ForwardedRef, forwardRef } from "react";

import { PopoverContent, type PopoverContentProps } from "~/components/floating/PopoverContent";
import { classNames } from "~/components/types";

export interface SelectPopoverContentProps extends Omit<PopoverContentProps, "children" | "ref"> {
  readonly children: JSX.Element;
}

export const SelectPopoverContent = forwardRef<HTMLDivElement, SelectPopoverContentProps>(
  ({ children, ...props }: SelectPopoverContentProps, ref: ForwardedRef<HTMLDivElement>) => (
    /* The style is needed for the PopoverContent to be positioned correctly with the Popover
       component's prop injection. */
    <PopoverContent
      {...props}
      ref={ref}
      className={classNames("p-0 border-none overflow-hidden", props.className)}
    >
      {children}
    </PopoverContent>
  ),
);
