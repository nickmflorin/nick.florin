import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { type ApiDetail, type DetailIncludes, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";

import { type ApiStandardDetailQuery, type Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export type GetDetailParams<I extends DetailIncludes> = ApiStandardDetailQuery<I>;

export const getDetail = cache(
  async <I extends DetailIncludes>(
    id: string,
    { includes, visibility }: GetDetailParams<I>,
  ): Promise<ApiDetail<I> | null> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }

    const detail = await db.detail.findUnique({
      where: {
        id,
        visible: visibility === "public" ? true : undefined,
      },
      include: {
        project: {
          include: {
            skills: fieldIsIncluded("skills", includes)
              ? { where: { visible: visibility === "public" ? true : undefined } }
              : undefined,
          },
        },
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        nestedDetails: fieldIsIncluded("nestedDetails", includes)
          ? {
              /* Accounts for cases where multiple details were created at the same time due to
             seeding. */
              orderBy: [{ createdAt: "desc" }, { id: "desc" }],
              include: {
                skills: fieldIsIncluded("skills", includes)
                  ? { where: { visible: visibility === "public" ? true : undefined } }
                  : undefined,
                project: {
                  include: {
                    skills: fieldIsIncluded("skills", includes)
                      ? { where: { visible: visibility === "public" ? true : undefined } }
                      : undefined,
                  },
                },
              },
            }
          : undefined,
      },
    });
    if (detail) {
      return convertToPlainObject(detail) as ApiDetail<I>;
    }
    return null;
  },
) as {
  <I extends DetailIncludes>(
    id: string,
    params: { includes: I; visibility: Visibility },
  ): Promise<ApiDetail<I> | null>;
};
