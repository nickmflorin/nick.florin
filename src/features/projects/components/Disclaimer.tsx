import { type ReactNode } from "react";

import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";
import { Label } from "~/components/typography";

export interface DisclaimerProps extends ComponentProps {
  readonly children: ReactNode;
}

export const Disclaimer = ({ children, ...props }: DisclaimerProps): JSX.Element => (
  <div
    className={classNames(
      "flex flex-col gap-[8px]",
      "w-full max-w-[900px] mx-auto",
      "bg-yellow-50 border border-yellow-400 p-[16px] rounded-md",
      "px-[16px] py-[12px] max-md:px-[12px] max-md:py-[8px]",
      props.className,
    )}
  >
    <Label>Disclaimer</Label>
    {children}
  </div>
);
