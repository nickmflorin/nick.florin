import { type ReactNode } from "react";

import clsx from "clsx";

import { type Action } from "~/components/structural";
import { type ComponentProps } from "~/components/types";

import { ModuleHeader } from "./ModuleHeader";

export interface ModuleProps extends ComponentProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly actions?: Action[];
  readonly overflow?: boolean;
}

export const Module = ({ title, actions, overflow = false, ...props }: ModuleProps) => (
  <div
    {...props}
    className={clsx(
      "flex flex-col gap-[12px] border rounded-md py-[12px] px-[18px] shadow-sm",
      { "overflow-y-auto": overflow },
      props.className,
    )}
  >
    <ModuleHeader actions={actions}>{title}</ModuleHeader>
    <div className={clsx("flex flex-col gap-[12px]", { "overflow-y-auto": overflow })}>
      {props.children}
    </div>
  </div>
);
