import type { ApiProject, ProjectIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const fetchProject = <I extends ProjectIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, isAdmin): StandardFetchActionReturn<ApiProject<I>> => {
      let project = (await db.project.findUnique({
        where: { id },
        include: {
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isAdmin ? undefined : true } }
            : undefined,
          repositories: fieldIsIncluded("repositories", includes)
            ? { where: { visible: isAdmin ? undefined : true } }
            : undefined,
        },
      })) as ApiProject<I>;
      if (!project) {
        return ApiClientGlobalError.NotFound({
          message: "The project could not be found.",
        });
      } else if (!isAdmin && !project.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      if (fieldIsIncluded("nestedDetails", includes)) {
        project = {
          ...project,
          nestedDetails: await db.nestedDetail.findMany({
            where: { projectId: { in: [project.id] } },
          }),
        };
      }
      if (fieldIsIncluded("details", includes)) {
        project = {
          ...project,
          details: await db.detail.findMany({
            where: { projectId: { in: [project.id] } },
          }),
        };
      }
      return project as ApiProject<I>;
    },
    { authenticated: true, adminOnly: true },
  );
