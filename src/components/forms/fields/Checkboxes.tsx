import type { ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps, sizeToString, type Size } from "~/components/types";

export interface CheckboxesProps extends ComponentProps {
  readonly orientation?: "horizontal" | "vertical";
  readonly gap?: Size;
  readonly children: ReactNode;
  readonly outer?: boolean;
}

export const Checkboxes = ({
  gap = "16px",
  outer = false,
  children,
  orientation = "horizontal",
  ...props
}: CheckboxesProps) => (
  <div
    {...props}
    className={classNames(
      "flex",
      {
        "flex-row": orientation === "horizontal",
        "flex-col": orientation === "vertical",
        "mt-[6px]": outer,
      },
      props.className,
    )}
    style={{ gap: sizeToString(gap, "px") }}
  >
    {children}
  </div>
);
