import clsx from "clsx";

import type { IconName } from "@fortawesome/fontawesome-svg-core";

import { type BrandProject } from "~/prisma/model";
import { ProjectLink } from "~/components/buttons/ProjectLink";
import { Icon } from "~/components/icons/Icon";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography/Description";

export interface ProjectTileProps extends ComponentProps {
  readonly project: BrandProject;
}

/* TODO: We eventually may want to solidify types related to the available IconName(s) so we can
   use it for schema validation of data coming from the database. */
export const ProjectTile = ({ project, ...props }: ProjectTileProps) => (
  <div {...props} className={clsx("flex flex-row gap-[12px] max-w-full w-full", props.className)}>
    <Icon className="text-gray-600" name={project.icon as IconName} size={20} />
    <div className={clsx("flex flex-col gap-[4px] max-w-[calc(100%-40px)]")}>
      <ProjectLink project={project} className="truncate" />
      <Description className="text-body-light" fontSize="xs">
        {project.description}
      </Description>
    </div>
  </div>
);
