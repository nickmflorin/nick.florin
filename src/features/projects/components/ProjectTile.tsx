import { type IconName } from '@fortawesome/fontawesome-svg-core';

import { type BrandProject, ProjectSlugs } from '~/database/model';
import { logger } from '~/internal/logger';

import { ProjectLink } from '~/components/buttons/ProjectLink';
import { type ComponentProps } from '~/components/types';
import { ResumeSimpleTile } from '~/features/resume/components/tiles/ResumeSimpleTile';

export interface ProjectTileProps extends ComponentProps {
  readonly isDescriptionVisible?: boolean;
  readonly project: BrandProject;
}

export const ProjectTile = ({
  isDescriptionVisible = true,
  project,
  ...props
}: ProjectTileProps) => {
  let icon: IconName;
  const slug = project.slug;
  if (ProjectSlugs.contains(slug)) {
    icon = ProjectSlugs.getModel(slug).icon;
  } else {
    logger.warn(
      'Encountered a project stored in the database without a corresponding hard-coded slug: ' +
        `${slug}.`,
      { slug },
    );
    // This is the default, fallback icon...
    icon = 'chart-kanban';
  }
  return (
    <ResumeSimpleTile
      {...props}
      description={isDescriptionVisible ? project.description : null}
      icon={icon}
    >
      <ProjectLink className='truncate' project={project} />
    </ResumeSimpleTile>
  );
};
