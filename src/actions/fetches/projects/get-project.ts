import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { type ApiProject, type ProjectIncludes, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";

import { type ApiStandardDetailQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export type GetProjectParams<I extends ProjectIncludes> = ApiStandardDetailQuery<I>;

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
    await getClerkAuthedUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }
    let project = (await db.project.findUnique({
      where: { id },
      include: {
        repositories: fieldIsIncluded("repositories", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
    })) as ApiProject<I>;

    if (fieldIsIncluded("details", includes)) {
      project = {
        ...project,
        details: await db.detail.findMany({
          where: { projectId: project.id },
        }),
      };
    }

    if (fieldIsIncluded("nestedDetails", includes)) {
      project = {
        ...project,
        nestedDetails: await db.nestedDetail.findMany({
          where: { projectId: project.id },
        }),
      };
    }

    return convertToPlainObject(project);
  },
) as {
  <I extends ProjectIncludes>(
    id: string,
    params: GetProjectParams<I>,
  ): Promise<ApiProject<I> | null>;
};
