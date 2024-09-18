import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import {
  type ApiExperience,
  DetailEntityType,
  type ExperienceIncludes,
  fieldIsIncluded,
  type ExperienceToDetailIncludes,
} from "~/database/model";
import { db } from "~/database/prisma";
import { logger } from "~/internal/logger";
import { isUuid } from "~/lib/typeguards";

import { type ApiStandardDetailQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { getDetails } from "../details";

export type GetExperienceParams<I extends ExperienceIncludes> = ApiStandardDetailQuery<I>;

export const preloadExperience = <I extends ExperienceIncludes>(
  id: string,
  params: GetExperienceParams<I>,
) => {
  void getExperience(id, params);
};

export const getExperience = cache(
  async <I extends ExperienceIncludes>(
    id: string,
    { visibility, includes }: GetExperienceParams<I>,
  ): Promise<ApiExperience<I> | null> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });
    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }
    const experience = await db.experience.findUnique({
      where: { id, visible: visibility === "public" ? true : undefined },
      include: {
        company: true,
        skills: fieldIsIncluded("skills", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
    });
    if (!experience) {
      return null;
    }
    if (fieldIsIncluded("details", includes)) {
      const details = await getDetails([experience.id], DetailEntityType.EXPERIENCE, {
        visibility,
        includes: (fieldIsIncluded("skills", includes)
          ? ["nestedDetails", "skills"]
          : ["nestedDetails"]) as ExperienceToDetailIncludes<I>,
      });
      return convertToPlainObject({ ...experience, details }) as ApiExperience<I>;
    }
    return convertToPlainObject(experience) as ApiExperience<I>;
  },
) as {
  <I extends ExperienceIncludes>(
    id: string,
    params: GetExperienceParams<I>,
  ): Promise<ApiExperience<I> | null>;
};
