import { type JSX, type ReactNode } from 'react';

import { type LabeledNavItem } from '~/application/pages';
import { ProjectSlugs } from '~/database/model';
import { logger } from '~/internal/logger';
import { humanizeList } from '~/lib/formatters';

import { getNavigationProjects } from '~/actions/projects/get-navigation-projects';

import { TabbedContent } from '~/components/layout/TabbedContent';

interface AdminLayoutProps {
  readonly children: ReactNode;
}

/* The projects are read through a cross-request cache rather than fetched per request: the
   navigation is identical for every visitor and changes only when a project is mutated, at which
   point those actions invalidate the tag. Reading it per request made this layout a blocking
   database round trip in front of every '/projects/*' route.

   The read returns every project regardless of visibility, so that a log can be issued when a
   hard-coded project slug in ProjectSlugs has no corresponding project in the database. A project
   that is in the database but not visible needs no warning, since its slug is expected to be
   absent from the navigation items. */

const ProjectsLayout = async ({ children }: AdminLayoutProps): Promise<JSX.Element> => {
  const projects = await getNavigationProjects();
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
