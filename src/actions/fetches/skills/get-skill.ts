import "server-only";
import { cache } from "react";

import { DateTime } from "luxon";

import { getClerkAuthedUser } from "~/application/auth/server";
import { logger } from "~/application/logger";
import { strictArrayLookup, minDate } from "~/lib";
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

    const projects = await prisma.project.findMany({
      where: { skills: { some: { id: skill.id } } },
      include: { skills: true },
      /* It does not matter if two models have the same start date because we are only interested
         in the oldest. */
      orderBy: { startDate: "asc" },
    });

    /* A course in and of itself does not have a start date that can be used for inferring
       experience of a skill.  However, it is tied to an education that does - so we can use the
       start date on an education that is tied to a course that is associated with the skill. */
    const courses = await prisma.course.findMany({
      where: { skills: { some: { id: skill.id } } },
      include: { skills: true, education: true },
      /* It does not matter if two models have the same start date because we are only interested
         in the oldest. */
      orderBy: { education: { startDate: "asc" } },
    });

    const experiences = await prisma.experience.findMany({
      where: { skills: { some: { id: skill.id } } },
      include: { skills: true, company: true },
      /* It does not matter if two models have the same start date because we are only interested
         in the oldest. */
      orderBy: { startDate: "asc" },
    });

    const educations = await prisma.education.findMany({
      where: {
        OR: [
          { skills: { some: { id: skill.id } } },
          { courses: { some: { skills: { some: { id: skill.id } } } } },
        ],
      },
      include: { skills: true, school: true },
      /* It does not matter if two models have the same start date because we are only interested
         in the oldest. */
      orderBy: { startDate: "asc" },
    });

    const oldestEducation = strictArrayLookup(educations, 0, {});
    const oldestExperience = strictArrayLookup(experiences, 0, {});
    const oldestProject = strictArrayLookup(projects, 0, {});
    const oldestCourse = strictArrayLookup(courses, 0, {});
    const oldestDate = minDate(
      oldestEducation?.startDate,
      oldestExperience?.startDate,
      oldestProject?.startDate,
      oldestCourse?.education.startDate,
    );

    return convertToPlainObject({
      ...skill,
      autoExperience: oldestDate
        ? Math.round(DateTime.now().diff(DateTime.fromJSDate(oldestDate), "years").years)
        : 0,
    }) as ApiSkill<I>;
  },
) as <I extends SkillIncludes>(
  id: string,
  params: GetSkillParams<I>,
) => Promise<ApiSkill<I> | null>;
