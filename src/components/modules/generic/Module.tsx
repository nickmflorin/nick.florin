import { type ReactNode } from "react";

import clsx from "clsx";

import { type Action } from "~/components/structural";
import { type ComponentProps } from "~/components/types";

import { ModuleHeader } from "./ModuleHeader";

export interface ModuleProps extends ComponentProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly actions?: Action[];
}

export const Module = ({ title, actions, ...props }: ModuleProps) => (
  <div
    {...props}
    className={clsx(
      "flex flex-col gap-[12px] overflow-hidden border rounded-md px-[12px] py-[18px]",
      props.className,
    )}
  >
    <ModuleHeader actions={actions}>{title}</ModuleHeader>
    <div className="flex flex-col gap-[12px] overflow-y-auto">{props.children}</div>
  </div>
);
