import type { ReactNode } from "react";

import { type ComponentProps, classNames } from "~/components/types";
import { sizeToString, type QuantitativeSize } from "~/components/types/sizes";

export interface CheckboxesProps extends ComponentProps {
  readonly orientation?: "horizontal" | "vertical";
  readonly gap?: QuantitativeSize<"px">;
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
    className={classNames("flex", {
      "flex-row": orientation === "horizontal",
      "flex-col": orientation === "vertical",
      "mt-[6px]": outer,
    })}
    style={{ gap: sizeToString(gap, "px") }}
  >
    {children}
  </div>
);
