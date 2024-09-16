import { type ReactNode, forwardRef } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { type Size, sizeToString } from "~/components/types/sizes";

export interface PopoverContentProps
  extends ComponentProps,
    Omit<React.ComponentProps<"div">, keyof ComponentProps> {
  readonly children: ReactNode;
  readonly maxHeight?: Size | null;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className, maxHeight, ...props }: PopoverContentProps, ref) => (
    <div
      {...props}
      ref={ref}
      className={classNames("popover-content", className)}
      style={{
        ...props.style,
        maxHeight: maxHeight ? sizeToString(maxHeight, "px") : props.style?.maxHeight,
      }}
    >
      {children}
    </div>
  ),
);
