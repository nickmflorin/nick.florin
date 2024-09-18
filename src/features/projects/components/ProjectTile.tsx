import type { IconName } from "@fortawesome/fontawesome-svg-core";

import { ProjectSlugs } from "~/database/model";
import { type BrandProject } from "~/database/model";
import { logger } from "~/internal/logger";

import { ProjectLink } from "~/components/buttons/ProjectLink";
import { type ComponentProps } from "~/components/types";
import { ResumeSimpleTile } from "~/features/resume/components/tiles/ResumeSimpleTile";

export interface ProjectTileProps extends ComponentProps {
  readonly project: BrandProject;
  readonly includeDescription?: boolean;
}

/* TODO: We eventually may want to solidify types related to the available IconName(s) so we can
   use it for schema validation of data coming from the database. */
export const ProjectTile = ({ project, includeDescription = true, ...props }: ProjectTileProps) => {
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
    <ResumeSimpleTile
      {...props}
      icon={icon}
      description={includeDescription ? project.description : null}
    >
      <ProjectLink project={project} className="truncate" />
    </ResumeSimpleTile>
  );
};
