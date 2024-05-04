import "server-only";
import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { type ApiSkill, type SkillIncludes, fieldIsIncluded } from "~/prisma/model";
import { type ApiStandardDetailQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

export type GetSkillParams<I extends SkillIncludes> = ApiStandardDetailQuery<I>;

export const preloadSkill = <I extends SkillIncludes>(id: string, params: GetSkillParams<I>) => {
  void getSkill(id, params);
};

export const getSkill = cache(
  async <I extends SkillIncludes>(
    id: string,
    { visibility, includes }: GetSkillParams<I>,
  ): Promise<ApiSkill<I> | null> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });

    if (!isUuid(id)) {
      logger.error(`Unexpectedly received invalid ID, '${id}', when fetching a course.`, {
        id,
        includes,
      });
      return null;
    }

    const skill = await prisma.skill.findUnique({
      where: { id, visible: visibility === "public" ? true : undefined },
      include: {
        courses: fieldIsIncluded("courses", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        repositories: fieldIsIncluded("repositories", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        projects: fieldIsIncluded("projects", includes),
        educations: fieldIsIncluded("educations", includes)
          ? {
              where: { visible: visibility === "public" ? true : undefined },
              include: { school: true },
            }
          : undefined,
        experiences: fieldIsIncluded("experiences", includes)
          ? {
              where: { visible: visibility === "public" ? true : undefined },
              include: { company: true },
            }
          : undefined,
      },
    });

    if (!skill) {
      return null;
    }
    return convertToPlainObject(skill as ApiSkill<I>);
  },
) as <I extends SkillIncludes>(
  id: string,
  params: GetSkillParams<I>,
) => Promise<ApiSkill<I> | null>;
