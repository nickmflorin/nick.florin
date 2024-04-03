import clsx from "clsx";

import { type ApiProject } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

export interface ProjectProps extends ComponentProps {
  readonly title: string;
  readonly description: JSX.Element;
  readonly project: ApiProject<["skills"]>;
  readonly children: JSX.Element | JSX.Element[];
}

export const Project = ({ title, description, children, project, ...props }: ProjectProps) => (
  <div
    {...props}
    className={clsx("w-full max-w-[900px] flex flex-col gap-[16px] mx-auto", props.className)}
  >
    <div {...props} className={clsx("w-full flex flex-col gap-[16px]", props.className)}>
      <Title order={3}>{title}</Title>
      <div className="flex flex-col gap-[12px]">
        {description}
        <Skills skills={project.skills} />
      </div>
    </div>
    <div key="1" className="flex flex-col gap-[20px]">
      {children}
    </div>
  </div>
);
