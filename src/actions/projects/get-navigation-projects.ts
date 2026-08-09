import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { db } from '~/database/prisma';

/**
 * The cache tag under which the navigation-projects read is stored cross-request.
 *
 * Every project mutation calls `updateTag` with this tag. The highlight toggles do not actually
 * change anything the navigation renders, but they are tagged along with the rest so that the
 * invariant is simply "a project mutation invalidates the project navigation" — an exclusion list
 * would have to be re-derived every time the navigation's projection changes, and the cost of
 * over-invalidating is one query on a rare admin action.
 */
export const NavigationProjectsCacheTag = 'navigation-projects';

/**
 * A project as the `/projects/*` navigation needs it.
 *
 * Invisible projects are included rather than filtered out in the query, because the layout both
 * builds the navigation from the visible ones and reconciles every stored slug against the
 * hard-coded `ProjectSlugs`.
 */
export type NavigationProject = {
  readonly name: string;
  readonly shortName: null | string;
  readonly slug: string;
  readonly visible: boolean;
};

/* The ordering is fixed only so that the cached payload is deterministic; the navigation orders
   itself by `ProjectSlugs`. The hour-long life bounds staleness against writes that do not go
   through the project mutations, such as seeding. */
export const getNavigationProjects = async (): Promise<NavigationProject[]> => {
  'use cache';
  cacheTag(NavigationProjectsCacheTag);
  cacheLife('hours');

  return await db.project.findMany({
    orderBy: { slug: 'asc' },
    select: { name: true, shortName: true, slug: true, visible: true },
  });
};
