import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

import { ModuleContent } from "./ModuleContent";
import { ModuleHeader } from "./ModuleHeader";

export interface ModuleProps extends ComponentProps {
  readonly children: ReactNode;
}

const LocalModule = ({ children, ...props }: ModuleProps) => (
  <div {...props} className={clsx("module", props.className)}>
    {children}
  </div>
);

export const Module = Object.assign(LocalModule, {
  Header: ModuleHeader,
  Content: ModuleContent,
});
