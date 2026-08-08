import 'server-only';

import { type Project, type ProjectSlug, type Repository, type Skill } from '~/database/model';
import { db } from '~/database/prisma';

/**
 * A project as a `/projects/*` page renders it.
 *
 * The projection is deliberately narrow because the page's skill badges are rendered by a client
 * component: every column of every related skill the query returns is serialized into the RSC
 * payload, whether or not anything reads it.
 */
export type PageProject = Pick<Project, 'id' | 'name' | 'visible'> & {
  readonly repositories: Pick<Repository, 'description' | 'npmPackageName' | 'slug'>[];
  readonly skills: Pick<Skill, 'id' | 'label' | 'prioritized'>[];
};

/**
 * Reads the project identified by the provided slug, projected down to {@link PageProject}.
 *
 * The projection carries no `Date` columns and no computed fields, so the result is already a plain
 * object and needs no superjson round trip before it crosses into the tree.
 */
export const getPageProject = async (slug: ProjectSlug): Promise<PageProject> =>
  await db.project.findUniqueOrThrow({
    select: {
      id: true,
      name: true,
      repositories: { select: { description: true, npmPackageName: true, slug: true } },
      skills: { select: { id: true, label: true, prioritized: true } },
      visible: true,
    },
    where: { slug },
  });
