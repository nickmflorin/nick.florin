import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { fieldIsIncluded, type ApiSchool, type SchoolIncludes } from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";

import type { ApiStandardDetailQuery, Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export type GetSchoolParams<I extends SchoolIncludes> = ApiStandardDetailQuery<I>;

export const preloadSchool = <I extends SchoolIncludes>(
  id: string,
  params: { includes: I; visibility: Visibility },
) => {
  void getSchool(id, params);
};

export const getSchool = cache(
  async <I extends SchoolIncludes>(
    id: string,
    { includes, visibility }: GetSchoolParams<I>,
  ): Promise<ApiSchool<I> | null> => {
    await getClerkAuthedUser({ strict: visibility !== "public" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a school.`, {
        id,
        includes,
      });
      return null;
    }
    const school = await db.school.findUnique({
      where: { id },
      include: {
        educations: fieldIsIncluded("educations", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
    });
    if (school) {
      return convertToPlainObject(school) as ApiSchool<I>;
    }
    return null;
  },
) as {
  <I extends SchoolIncludes>(
    id: string,
    params: { includes: I; visibility: Visibility },
  ): Promise<ApiSchool<I> | null>;
};
