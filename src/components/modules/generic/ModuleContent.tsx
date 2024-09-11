import { type ReactNode } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface ModuleContentProps extends ComponentProps {
  readonly children: ReactNode;
  readonly scrollable?: boolean;
}

export const ModuleContent = ({ scrollable = false, children, ...props }: ModuleContentProps) => (
  <div
    {...props}
    className={classNames(
      "module__content",
      { "overflow-y-auto pr-[16px]": scrollable },
      props.className,
    )}
  >
    {children}
  </div>
);
