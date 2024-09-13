import { type ReactNode } from "react";

import { classNames, type ComponentProps } from "~/components/types";

export interface ContentProps extends ComponentProps {
  readonly children: ReactNode;
  readonly scrollable?: boolean;
  readonly outerClassName?: ComponentProps["className"];
}

export const Content = ({ children, outerClassName, scrollable, ...props }: ContentProps) => (
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
    <div {...props} className={classNames("content__scroll-viewport", props.className)}>
      {children}
    </div>
  </div>
);
