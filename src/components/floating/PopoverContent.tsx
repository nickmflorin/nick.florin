import { type ReactNode, forwardRef } from "react";

import { Loading } from "~/components/loading/Loading";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { sizeToString, type QuantitativeSize } from "~/components/types/sizes";

export interface PopoverContentProps
  extends ComponentProps,
    Omit<React.ComponentProps<"div">, keyof ComponentProps> {
  readonly isLoading?: boolean;
  readonly children: ReactNode;
  readonly maxHeight?: QuantitativeSize<"px"> | null;
}

export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className, maxHeight, isLoading, ...props }: PopoverContentProps, ref) => (
    <div
      {...props}
      ref={ref}
      className={classNames("popover-content", className)}
      data-attr-loading={isLoading}
      style={{
        ...props.style,
        maxHeight: maxHeight ? sizeToString(maxHeight, "px") : props.style?.maxHeight,
      }}
    >
      <Loading isLoading={isLoading} position="fixed">
        {children}
      </Loading>
    </div>
  ),
);
