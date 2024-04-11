import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { fieldIsIncluded, type ApiCourse, type CourseIncludes } from "~/prisma/model";
import type { Visibility } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export const preloadCourse = <I extends CourseIncludes>(
  id: string,
  { includes, visibility }: { includes: I; visibility: Visibility },
) => {
  void getCourse(id, { includes, visibility });
};

export const getCourse = cache(
  async <I extends CourseIncludes>(
    id: string,
    { includes, visibility }: { includes: I; visibility: Visibility },
  ): Promise<ApiCourse<I> | null> => {
    await getAuthAdminUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }
    const course = await prisma.course.findUnique({
      where: { id, visible: visibility === "public" ? true : undefined },
      include: {
        /* Note: If the education is not visible and we are in the public context, we still return
           the skill - at least for right now. */
        education: fieldIsIncluded("education", includes)
          ? { include: { school: true } }
          : undefined,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
    });
    if (!course) {
      return null;
    }
    return convertToPlainObject(course) as ApiCourse<I>;
  },
) as {
  <I extends CourseIncludes>(
    id: string,
    params: { includes: I; visibility: Visibility },
  ): Promise<ApiCourse<I> | null>;
};
