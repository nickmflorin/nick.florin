import { type ApiRepository, fieldIsIncluded, type RepositoryIncludes } from '~/database/model';
import { db } from '~/database/prisma';

import { standardDetailFetchAction, type StandardFetchActionReturn } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const fetchRepository = <I extends RepositoryIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiRepository<I>> => {
      const repo = await db.repository.findUnique({
        include: {
          projects: fieldIsIncluded('projects', includes)
            ? { where: { visible: isVisible } }
            : undefined,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        where: { id },
      });
      if (!repo) {
        return ApiClientGlobalError.NotFound({
          message: 'The repository could not be found.',
        });
      } else if (!isAdmin && !repo.visible) {
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
        });
      }
      return repo as ApiRepository<I>;
    },
    { adminOnly: true, authenticated: true },
  );
