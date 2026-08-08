import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { sortBy } from 'lodash-es';

import { type Project, type ProjectSlug, ProjectSlugs } from '~/database/model';
import { db } from '~/database/prisma';
import { logger } from '~/internal/logger';

/**
 * Returns the index of the given slug in {@link ProjectSlugs}, so that projects can be ordered
 * consistently with the tabs on the Projects page and redirected to the first tab associated with
 * a project that is visible.
 *
 * @param {ProjectSlug} slug The slug to determine the tab order index for.
 *
 * @returns {number} The index of the slug in {@link ProjectSlugs}.
 */
const getProjectTabOrderIndex = (slug: ProjectSlug): number => {
  const slugIndex = [...ProjectSlugs.members].indexOf(slug);
  if (slugIndex === -1) {
    throw new Error(
      `Could not find slug '${slug}' in ProjectSlugs even though they were all already ` +
        'verified to exist!',
    );
  }
  return slugIndex;
};

export interface RedirectIfNotVisibleProps {
  readonly children: ReactNode;
  readonly project: Pick<Project, 'id' | 'visible'>;
}

export const RedirectIfNotVisible = async ({ children, project }: RedirectIfNotVisibleProps) => {
  if (!project.visible) {
    const otherProjects = await db.project.findMany({
      select: { slug: true },
      where: { id: { notIn: [project.id] }, visible: true },
    });

    const slugs = otherProjects.reduce((acc, proj) => {
      if (ProjectSlugs.contains(proj.slug)) {
        return [...acc, proj.slug];
      }
      logger.warn(
        `Encountered a project '${proj.slug}' stored in the database without a corresponding ` +
          'hard-coded slug.',
        { slug: proj.slug },
      );
      return acc;
    }, [] as ProjectSlug[]);

    const ordered = sortBy(slugs, getProjectTabOrderIndex);
    if (ordered.length === 0) {
      return redirect('/404');
    }
    return redirect(`/projects/${ordered[0]}`);
  }
  return <>{children}</>;
};
