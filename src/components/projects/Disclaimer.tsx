import { type ReactNode } from "react";

import clsx from "clsx";

import type { ComponentProps } from "~/components/types";
import { Label } from "~/components/typography/Label";

export interface DisclaimerProps extends ComponentProps {
  readonly children: ReactNode;
}

export const Disclaimer = ({ children, ...props }: DisclaimerProps): JSX.Element => (
  <div
    className={clsx(
      "flex flex-col gap-[8px]",
      "w-full max-w-[900px] mx-auto",
      "bg-yellow-50 border border-yellow-400 p-[12px] rounded-md",
      props.className,
    )}
  >
    <Label>Disclaimer</Label>
    {children}
  </div>
);
