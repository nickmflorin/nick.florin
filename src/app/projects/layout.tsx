import { type JSX, type ReactNode } from 'react';

import { type LabeledNavItem } from '~/application/pages';
import { ProjectSlugs } from '~/database/model';
import { logger } from '~/internal/logger';
import { humanizeList } from '~/lib/formatters';

import { fetchProjects } from '~/actions/projects/fetch-projects';

import { TabbedContent } from '~/components/layout/TabbedContent';

interface AdminLayoutProps {
  readonly children: ReactNode;
}

/**
 * Fetches all projects, regardless of visibility, so that a log can be issued when a hard-coded
 * project slug in {@link ProjectSlugs} does not have a corresponding project in the database.  A
 * project that is in the database but not visible does not need a warning, since its slug is
 * expected to be absent from the navigation items.
 */
const fetchAllProjectsForSlugValidation = () =>
  fetchProjects([])({ filters: {}, forceVisibility: true, visibility: 'admin' }, { strict: true });

const ProjectsLayout = async ({ children }: AdminLayoutProps): Promise<JSX.Element> => {
  const { data: projects } = await fetchAllProjectsForSlugValidation();
  const missingProjs = projects.filter(project => !ProjectSlugs.contains(project.slug));
  if (missingProjs.length !== 0) {
    const missingSlugs = missingProjs.map(project => project.slug);
    const humanized = humanizeList(missingSlugs, { conjunction: 'and', formatter: v => `'${v}'` });
    logger.warn(
      'Encountered project(s) stored in the database without a corresponding hard-coded slug: ' +
        `${humanized}.`,
      { slugs: missingSlugs },
    );
  }

  /**
   * Builds the navigation items in the order defined by the enumerated literals definition of
   * {@link ProjectSlugs}, rather than the order of the fetched projects, so that the items shown
   * in the nav are ordered consistently with that definition.
   */
  const buildOrderedNavItems = (): LabeledNavItem[] =>
    [...ProjectSlugs.members].reduce((acc: LabeledNavItem[], slug): LabeledNavItem[] => {
      const proj = projects.find(project => project.slug === slug);
      if (proj === undefined) {
        logger.error(
          `Encountered a hard-coded project slug, '${slug}', that does not have a corresponding ` +
            'project in the database.',
          { slug },
        );
        return acc;
      } else if (proj.visible === false) {
        return acc;
      }
      return [
        ...acc,
        {
          activePaths: { leadingPath: `/projects/${slug}` },
          icon: { name: ProjectSlugs.getModel(slug).icon },
          label: proj.shortName ?? proj.name,
          path: `/projects/${slug}`,
        },
      ];
    }, [] as LabeledNavItem[]);

  return <TabbedContent items={buildOrderedNavItems()}>{children}</TabbedContent>;
};

export default ProjectsLayout;
