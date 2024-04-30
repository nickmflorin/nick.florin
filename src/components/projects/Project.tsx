import clsx from "clsx";

import { type ApiProject } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { RepositoryTile } from "~/components/tiles/RepositoryTile";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

export interface ProjectProps extends ComponentProps {
  readonly title: string;
  readonly description: JSX.Element;
  readonly project: ApiProject<["skills", "repositories"]>;
  readonly children: JSX.Element | JSX.Element[];
}

export const Project = ({ title, description, children, project, ...props }: ProjectProps) => (
  <div
    {...props}
    className={clsx("w-full max-w-[900px] flex flex-col gap-[16px] mx-auto", props.className)}
  >
    <div {...props} className={clsx("w-full flex flex-col gap-[16px]", props.className)}>
      <Title order={3} className="max-md:text-title_sm">
        {title}
      </Title>
      <div className="flex flex-col gap-[12px]">
        {description}
        {project.repositories.length !== 0 && (
          // In actuality, there will only ever be 1 repository per project.
          <div className="flex flex-row gap-[10px]">
            {project.repositories.map((repo, index) => (
              <RepositoryTile key={index} repository={repo} />
            ))}
          </div>
        )}
        <Skills skills={project.skills} />
      </div>
    </div>
    <div key="1" className="flex flex-col gap-[20px]">
      {children}
    </div>
  </div>
);
