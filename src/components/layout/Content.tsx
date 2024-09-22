import { type ReactNode } from "react";

import {
  classNames,
  sizeToString,
  type ComponentProps,
  type QuantitativeSize,
} from "~/components/types";

export interface ContentProps extends ComponentProps {
  readonly children: ReactNode;
  readonly scrollable?: boolean;
  readonly outerClassName?: ComponentProps["className"];
  readonly padding?: QuantitativeSize<"px">;
}

export const Content = ({
  children,
  padding,
  outerClassName,
  scrollable,
  ...props
}: ContentProps) => (
  <div
    className={classNames(
      "content",
      {
        "overflow-y-auto": scrollable,
        "overflow-y-hidden": scrollable === false,
      },
      outerClassName,
    )}
  >
    <div
      {...props}
      className={classNames("content__scroll-viewport", props.className)}
      style={{
        ...props.style,
        paddingTop: padding ? sizeToString(padding, "px") : props.style?.paddingTop,
        paddingBottom: padding ? sizeToString(padding, "px") : props.style?.paddingBottom,
      }}
    >
      {children}
    </div>
  </div>
);
