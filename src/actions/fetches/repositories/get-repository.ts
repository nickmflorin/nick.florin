import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { fieldIsIncluded, type ApiRepository, type RepositoryIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export const preloadRepository = <I extends RepositoryIncludes>(
  id: string,
  { includes, visibility }: { includes: I; visibility: Visibility },
) => {
  void getRepository(id, { includes, visibility });
};

export const getRepository = cache(
  async <I extends RepositoryIncludes>(
    id: string,
    { includes, visibility }: { includes: I; visibility: Visibility },
  ): Promise<ApiRepository<I> | null> => {
    await getAuthAdminUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a repository.`, {
        id,
        includes,
      });
      return null;
    }

    const repository = await prisma.repository.findUnique({
      where: { id },
      include: {
        skills: fieldIsIncluded("skills", includes)
          ? {
              where: { visible: visibility === "public" ? true : undefined },
            }
          : undefined,
        projects: fieldIsIncluded("projects", includes),
      },
    });
    if (repository) {
      return convertToPlainObject(repository) as ApiRepository<I>;
    }
    return null;
  },
) as {
  <I extends RepositoryIncludes>(
    id: string,
    params: { includes: I; visibility: Visibility },
  ): Promise<ApiRepository<I> | null>;
};
