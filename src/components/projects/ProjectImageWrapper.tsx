import type { ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface ProjectImageWrapperProps extends ComponentProps {
  readonly children: ReactNode;
}

export const ProjectImageWrapper = ({ children, ...props }: ProjectImageWrapperProps) => (
  <div {...props} className={clsx("flex flex-col w-full", props.className)}>
    <div className="flex flex-col md:mx-auto max-w-[100%] md:w-[840px]">{children}</div>
  </div>
);
