import type { IconName } from "@fortawesome/fontawesome-svg-core";

import { logger } from "~/internal/logger";
import { ProjectSlugs } from "~/prisma/model";
import { type BrandProject } from "~/prisma/model";

import { ProjectLink } from "~/components/buttons/ProjectLink";
import { Icon } from "~/components/icons/Icon";
import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";
import { Description } from "~/components/typography";

export interface ProjectTileProps extends ComponentProps {
  readonly project: BrandProject;
}

/* TODO: We eventually may want to solidify types related to the available IconName(s) so we can
   use it for schema validation of data coming from the database. */
export const ProjectTile = ({ project, ...props }: ProjectTileProps) => {
  let icon: IconName;
  const slug = project.slug;
  if (!ProjectSlugs.contains(slug)) {
    logger.warn(
      `Encountered a project stored in the database without a corresponding hard-coded slug: ${slug}.`,
      { slug },
    );
    // This is the default, fallback icon...
    icon = "chart-kanban";
  } else {
    icon = ProjectSlugs.getModel(slug).icon;
  }
  return (
    <div
      {...props}
      className={classNames("flex flex-row gap-[12px] max-w-full w-full", props.className)}
    >
      <Icon className="text-gray-600" icon={icon} size={20} />
      <div className={classNames("flex flex-col gap-[4px] max-w-[calc(100%-40px)]")}>
        <ProjectLink project={project} className="truncate" />
        <Description fontSize="xs">{project.description}</Description>
      </div>
    </div>
  );
};