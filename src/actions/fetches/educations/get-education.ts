import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import {
  type ApiEducation,
  DetailEntityType,
  type EducationIncludes,
  fieldIsIncluded,
  type EducationToDetailIncludes,
} from "~/prisma/model";

import { type ApiStandardDetailQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { getDetails } from "../details";

export type GetEducationParams<I extends EducationIncludes> = ApiStandardDetailQuery<I>;

export const preloadEducation = <I extends EducationIncludes>(
  id: string,
  params: GetEducationParams<I>,
) => {
  void getEducation(id, params);
};

export const getEducation = cache(
  async <I extends EducationIncludes>(
    id: string,
    { visibility, includes }: GetEducationParams<I>,
  ): Promise<ApiEducation<I> | null> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }
    const education = await prisma.education.findUnique({
      where: { id, visible: visibility === "public" ? true : undefined },
      include: {
        school: true,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        courses: fieldIsIncluded("courses", includes)
          ? {
              include: { skills: fieldIsIncluded("skills", includes) },
              where: { visible: visibility === "public" ? true : undefined },
            }
          : undefined,
      },
    });
    if (!education) {
      return null;
    }
    if (fieldIsIncluded("details", includes)) {
      const details = await getDetails([education.id], DetailEntityType.EDUCATION, {
        visibility,
        includes: (fieldIsIncluded("skills", includes)
          ? ["nestedDetails", "skills"]
          : ["nestedDetails"]) as EducationToDetailIncludes<I>,
      });
      return convertToPlainObject({ ...education, details }) as ApiEducation<I>;
    }
    return convertToPlainObject(education) as ApiEducation<I>;
  },
) as {
  <I extends EducationIncludes>(
    id: string,
    params: GetEducationParams<I>,
  ): Promise<ApiEducation<I> | null>;
};
