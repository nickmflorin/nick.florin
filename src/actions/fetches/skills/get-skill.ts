import "server-only";
import { cache } from "react";

import { getAuthAdminUser } from "~/application/auth";
import { logger } from "~/application/logger";
import { isUuid } from "~/lib/typeguards";
import { prisma } from "~/prisma/client";
import { type ApiSkill, type SkillIncludes, fieldIsIncluded } from "~/prisma/model";
import { includeAutoExperience } from "~/actions/fetches/skills";
import { type Visibility } from "~/api/query";

import { convertToPlainObject } from "../../../api/serialization";

type GetSkillParams<I extends SkillIncludes> = {
  readonly visibility: Visibility;
  readonly includes: I;
};

export const preloadSkill = <I extends SkillIncludes>(id: string, params: GetSkillParams<I>) => {
  void getSkill(id, params);
};

export const getSkill = cache(
  async <I extends SkillIncludes>(
    id: string,
    { visibility, includes }: GetSkillParams<I>,
  ): Promise<ApiSkill<I> | null> => {
    await getAuthAdminUser({ strict: visibility === "admin" });

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
        repositories: fieldIsIncluded("repositories", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        projects: fieldIsIncluded("projects", includes),
        educations: fieldIsIncluded("educations", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
        experiences: fieldIsIncluded("experiences", includes)
          ? { where: { visible: visibility === "public" ? true : undefined } }
          : undefined,
      },
    });

    if (!skill) {
      return null;
    }

    const projects = await prisma.project.findMany({
      where: { skills: { some: { id: skill.id } } },
      include: { skills: true },
    });

    const experiences = await prisma.experience.findMany({
      where: { skills: { some: { id: skill.id } } },
      include: { skills: true, company: true },
    });

    const educations = await prisma.education.findMany({
      where: { skills: { some: { id: skill.id } } },
      include: { skills: true, school: true },
    });

    return convertToPlainObject(
      includeAutoExperience({ skill, projects, experiences, educations }),
    ) as ApiSkill<I>;
  },
) as <I extends SkillIncludes>(
  id: string,
  params: GetSkillParams<I>,
) => Promise<ApiSkill<I> | null>;
