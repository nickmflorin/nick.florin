import { type ApiProject, fieldIsIncluded, type ProjectIncludes } from '~/database/model';
import { db } from '~/database/prisma';

import { standardDetailFetchAction, type StandardFetchActionReturn } from '~/actions';
import { ApiClientGlobalError } from '~/api';

export const fetchProject = <I extends ProjectIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, { isAdmin, isVisible }): StandardFetchActionReturn<ApiProject<I>> => {
      let project = (await db.project.findUnique({
        include: {
          repositories: fieldIsIncluded('repositories', includes)
            ? { where: { visible: isVisible } }
            : undefined,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: isVisible } }
            : undefined,
        },
        where: { id },
      })) as ApiProject<I> | null;
      if (!project) {
        return ApiClientGlobalError.NotFound({
          message: 'The project could not be found.',
        });
      } else if (!isAdmin && !project.visible) {
        ApiClientGlobalError.Forbidden({
          message: 'The user does not have permission to access this data.',
        });
      }
      if (fieldIsIncluded('nestedDetails', includes)) {
        project = {
          ...project,
          nestedDetails: await db.nestedDetail.findMany({
            where: { projectId: { in: [project.id] } },
          }),
        };
      }
      if (fieldIsIncluded('details', includes)) {
        project = {
          ...project,
          details: await db.detail.findMany({
            where: { projectId: { in: [project.id] } },
          }),
        };
      }
      return project;
    },
    { adminOnly: true, authenticated: true },
  );
