import 'server-only';

import { unstable_cache as unstableCache } from 'next/cache';
import { cache } from 'react';

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
 * The number of seconds a cached navigation-projects read may serve before it is refreshed,
 * independent of the tag invalidation performed by the project mutations. It bounds staleness
 * against writes that do not go through those actions, such as seeding.
 */
const NavigationProjectsCacheRevalidateSeconds = 3600;

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

/* The projection is deliberately narrow and must stay free of `Date` fields: `unstable_cache`
   JSON-serializes what it stores, so a `Date` would come back as a string while its declared type
   went on claiming `Date`. The ordering is fixed only so that the cached payload is deterministic;
   the navigation orders itself by `ProjectSlugs`. */
const readNavigationProjects = unstableCache(
  async (): Promise<NavigationProject[]> =>
    await db.project.findMany({
      orderBy: { slug: 'asc' },
      select: { name: true, shortName: true, slug: true, visible: true },
    }),
  ['navigation-projects'],
  {
    revalidate: NavigationProjectsCacheRevalidateSeconds,
    tags: [NavigationProjectsCacheTag],
  },
);

export const getNavigationProjects = cache(
  async (): Promise<NavigationProject[]> => await readNavigationProjects(),
);
