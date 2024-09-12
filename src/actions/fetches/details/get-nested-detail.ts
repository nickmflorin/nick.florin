import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { type NestedApiDetail, type NestedDetailIncludes, fieldIsIncluded } from "~/prisma/model";

import { type Visibility, type ApiStandardDetailQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export type GetNestedDetailsParams<I extends NestedDetailIncludes> = ApiStandardDetailQuery<I>;

export const getNestedDetail = cache(
  async <I extends NestedDetailIncludes>(
    id: string,
    { includes, visibility }: GetNestedDetailsParams<I>,
  ): Promise<NestedApiDetail<I> | null> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }

    const detail = await prisma.nestedDetail.findUnique({
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
      },
    });
    if (detail) {
      return convertToPlainObject(detail) as NestedApiDetail<I>;
    }
    return null;
  },
) as {
  <I extends NestedDetailIncludes>(
    id: string,
    params: { includes: I; visibility: Visibility },
  ): Promise<NestedApiDetail<I> | null>;
};
