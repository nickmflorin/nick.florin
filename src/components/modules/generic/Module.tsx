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
      "border rounded-md py-[12px] px-[18px] shadow-sm",
      "flex flex-col gap-[12px] w-full max-w-full",
      props.className,
    )}
  >
    <ModuleHeader actions={actions}>{title}</ModuleHeader>
    <div className={clsx({ "overflow-y-auto pr-[16px]": scrollable }, contentClassName)}>
      {children}
    </div>
  </div>
);
