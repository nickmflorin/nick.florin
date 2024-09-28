import type { ApiRepository, RepositoryIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";

import { standardDetailFetchAction, type StandardFetchActionReturn } from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

export const fetchRepository = <I extends RepositoryIncludes>(includes: I) =>
  standardDetailFetchAction(
    async (id, _, isAdmin): StandardFetchActionReturn<ApiRepository<I>> => {
      const repo = await db.repository.findUnique({
        where: { id },
        include: {
          projects: fieldIsIncluded("projects", includes)
            ? { where: { visible: isAdmin ? undefined : true } }
            : undefined,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isAdmin ? undefined : true } }
            : undefined,
        },
      });
      if (!repo) {
        return ApiClientGlobalError.NotFound({
          message: "The repository could not be found.",
        });
      } else if (!isAdmin && !repo.visible) {
        ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      return repo as ApiRepository<I>;
    },
    { authenticated: true, adminOnly: true },
  );
