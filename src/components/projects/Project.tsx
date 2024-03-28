import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

export interface ProjectProps extends ComponentProps {
  readonly title: string;
  readonly description: ReactNode | ReactNode[];
  readonly children: JSX.Element | JSX.Element[];
}

export const Project = ({ title, description, children, ...props }: ProjectProps) => (
  <div
    {...props}
    className={clsx("w-full max-w-[900px] flex flex-col gap-[16px] mx-auto", props.className)}
  >
    <div {...props} className={clsx("w-full flex flex-col gap-[16px]", props.className)}>
      <Title order={3}>{title}</Title>
      <div className="w-full flex flex-col gap-[12px]">{description}</div>
    </div>
    <div key="1" className="flex flex-col gap-[20px]">
      {children}
    </div>
  </div>
);
