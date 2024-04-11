import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { fieldIsIncluded, type ApiSchool, type SchoolIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export const preloadSchool = <I extends SchoolIncludes>(
  id: string,
  params: { includes: I; visibility: Visibility },
) => {
  void getSchool(id, params);
};

export const getSchool = cache(
  async <I extends SchoolIncludes>(
    id: string,
    { includes, visibility }: { includes: I; visibility: Visibility },
  ): Promise<ApiSchool<I> | null> => {
    await getAuthAdminUser({ strict: visibility !== "public" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a school.`, {
        id,
        includes,
      });
      return null;
    }
    const school = await prisma.school.findUnique({
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
