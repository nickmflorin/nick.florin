import { type ReactNode } from "react";

import clsx from "clsx";

import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";
import { Title } from "~/components/typography/Title";

export interface ProjectProps extends ComponentProps {
  readonly title: string;
  readonly description: string[];
  readonly children: ReactNode;
}

export const Project = ({ title, description, children, ...props }: ProjectProps) => (
  <div
    {...props}
    className={clsx("w-full max-w-[900px] flex flex-col gap-[16px] mx-auto", props.className)}
  >
    <div {...props} className={clsx("w-full flex flex-col gap-[16px]", props.className)}>
      <Title order={3}>{title}</Title>
      <div className="w-full flex flex-col gap-[6px]">
        {description.map((desc, index) => (
          <Text key={index} className="text-gray-600">
            {desc}
          </Text>
        ))}
      </div>
    </div>
    {children}
  </div>
);
