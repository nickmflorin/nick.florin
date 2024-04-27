import { type ReactNode } from "react";

import clsx from "clsx";

import { type Action } from "~/components/structural";
import { type ComponentProps } from "~/components/types";

import { ModuleHeader } from "./ModuleHeader";

export interface ModuleProps extends ComponentProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly actions?: Action[];
  readonly scrollable?: boolean;
  readonly contentClassName?: ComponentProps["className"];
}

export const Module = ({
  title,
  actions,
  scrollable = false,
  contentClassName,
  children,
  ...props
}: ModuleProps) => (
  <div
    {...props}
    className={clsx(
      "flex flex-col border rounded-md py-[12px] px-[18px] shadow-sm",
      "overflow-x-hidden",
      props.className,
    )}
  >
    <div className="flex flex-col gap-[12px] h-full w-full max-h-full max-w-full overflow-x-hidden">
      <ModuleHeader actions={actions}>{title}</ModuleHeader>
      <div
        className={clsx(
          "flex flex-col gap-[12px] grow max-h-[calc(100%-32px-12px)]",
          { "overflow-y-auto pr-[16px]": scrollable },
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  </div>
);
