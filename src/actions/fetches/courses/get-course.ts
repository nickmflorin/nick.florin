import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { fieldIsIncluded, type ApiCourse, type CourseIncludes } from "~/prisma/model";
import { convertToPlainObject } from "~/actions/fetches/serialization";
import type { Visibility } from "~/api/query";

export const preloadCourse = <I extends CourseIncludes>(
  id: string,
  { includes, visibility }: { includes: I; visibility: Visibility },
) => {
  void getCourse(id, { includes, visibility });
};

export const getCourse = cache(
  async <I extends CourseIncludes>(
    id: string,
    { includes, visibility = "public" }: { includes: I; visibility?: Visibility },
  ): Promise<ApiCourse<I> | null> => {
    await getAuthAdminUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }
    if (fieldIsIncluded("education", includes)) {
      const course = await prisma.course.findUnique({
        where: { id, visible: visibility === "public" ? true : undefined },
        include: { education: { include: { school: true } } },
      });
      if (!course) {
        return null;
      }
      if (fieldIsIncluded("skills", includes)) {
        return convertToPlainObject({
          ...course,
          skills: (
            await prisma.skill.findMany({
              where: {
                courses: { some: { courseId: course.id } },
                visible: visibility === "public" ? true : undefined,
              },
            })
          ).map(convertToPlainObject),
        }) as ApiCourse<I>;
      }
      return convertToPlainObject(course) as ApiCourse<I>;
    }
    const course = await prisma.course.findUnique({
      where: { id, visible: visibility === "public" ? true : undefined },
    });
    if (!course) {
      return null;
    }
    if (fieldIsIncluded("skills", includes)) {
      return convertToPlainObject({
        ...course,
        skills: (
          await prisma.skill.findMany({
            where: {
              courses: { some: { courseId: course.id } },
              visible: visibility === "public" ? true : undefined,
            },
          })
        ).map(convertToPlainObject),
      }) as ApiCourse<I>;
    }
    return convertToPlainObject(course) as ApiCourse<I>;
  },
) as {
  <I extends CourseIncludes>(
    id: string,
    params: { includes: I; visibility: Visibility },
  ): Promise<ApiCourse<I> | null>;
};
