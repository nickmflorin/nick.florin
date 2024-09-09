import clsx from "clsx";

import { type ApiProject } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { RepositoryTile } from "~/components/tiles/RepositoryTile";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";
import Badge from "~/components/badges/Badge";

export interface ProjectProps extends ComponentProps {
  readonly title: string;
  readonly description: JSX.Element;
  readonly project: ApiProject<["skills", "repositories"]>;
  readonly children: JSX.Element | JSX.Element[];
  readonly underConstruction?: boolean;
}

export const Project = ({
  title,
  description,
  underConstruction,
  children,
  project,
  ...props
}: ProjectProps) => (
  <div
    {...props}
    className={clsx(
      "w-full max-w-[900px] flex flex-col gap-[12px] mx-auto max-md:gap-[8px] px-[16px]",
      props.className,
    )}
  >
    <div
      {...props}
      className={clsx("w-full flex flex-col gap-[16px] max-md:gap-[8px]", props.className)}
    >
      <div className="flex flex-row items-center gap-4">
        <Title order={3} className="max-md:text-title_sm max-w-fit">
          {title}
        </Title>
        {underConstruction && (
          <Badge className="bg-yellow-100 border-yellow-400">Page Under Construction</Badge>
        )}
      </div>
      <div className="flex flex-col gap-[16px] max-md:gap-[8px]">
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
    <div key="1" className="flex flex-col gap-[12px] max-md:gap-[8px]">
      {children}
    </div>
  </div>
);
