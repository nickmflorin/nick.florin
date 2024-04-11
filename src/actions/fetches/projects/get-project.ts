import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { type ApiProject, type ProjectIncludes, fieldIsIncluded } from "~/prisma/model";
import { type Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

type GetProjectParams<I extends ProjectIncludes> = {
  includes: I;
  visibility: Visibility;
};

export const preloadProject = <I extends ProjectIncludes>(
  id: string,
  params: GetProjectParams<I>,
) => {
  void getProject(id, params);
};

export const getProject = cache(
  async <I extends ProjectIncludes>(
    id: string,
    { includes, visibility }: GetProjectParams<I>,
  ): Promise<ApiProject<I> | null> => {
    await getAuthAdminUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        repositories: fieldIsIncluded("repositories", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
    });
    return project ? (convertToPlainObject(project) as ApiProject<I>) : null;
  },
) as {
  <I extends ProjectIncludes>(
    id: string,
    params: GetProjectParams<I>,
  ): Promise<ApiProject<I> | null>;
};
