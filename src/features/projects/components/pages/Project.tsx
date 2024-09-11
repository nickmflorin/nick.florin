import clsx from "clsx";

import { type ApiProject } from "~/prisma/model";

import Badge from "~/components/badges/Badge";
import { Skills } from "~/components/badges/collections/Skills";
import { RepositoryTile } from "~/components/tiles/RepositoryTile";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

import { Disclaimer } from "./Disclaimer";

export interface ProjectProps extends ComponentProps {
  readonly title: string;
  readonly disclaimer?: JSX.Element;
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
  disclaimer,
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
      className={clsx("w-full flex flex-col gap-[16px] max-sm:gap-[12px]", props.className)}
    >
      <div
        className={clsx(
          "flex flex-row sm:items-center gap-4",
          "max-sm:flex-col max-sm:items-start max-sm:gap-2",
        )}
      >
        <Title order={3} className="max-md:text-title_sm max-w-fit">
          {title}
        </Title>
        {underConstruction && (
          <Badge className="bg-yellow-100 border-yellow-400">Page Under Construction</Badge>
        )}
      </div>
      <div className="flex flex-col gap-[16px] max-md:gap-[12px]">
        {description}
        {project.repositories.length !== 0 && (
          // In actuality, there will only ever be 1 repository per project.
          <div className="flex flex-row gap-[10px] mb-2 max-sm:flex-col">
            {project.repositories.map((repo, index) => (
              <RepositoryTile key={index} repository={repo} />
            ))}
          </div>
        )}
        {disclaimer && <Disclaimer className="mb-2">{disclaimer}</Disclaimer>}
        <Skills skills={project.skills} className="mb-2" />
      </div>
    </div>
    <div key="1" className="flex flex-col gap-[12px] max-md:gap-[8px]">
      {children}
    </div>
  </div>
);