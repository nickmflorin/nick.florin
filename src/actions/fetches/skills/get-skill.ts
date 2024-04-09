import "server-only";
import { cache } from "react";

import { DateTime } from "luxon";

import { getAuthAdminUser } from "~/application/auth";
import { strictArrayLookup, minDate } from "~/lib";
import { prisma, isPrismaDoesNotExistError, isPrismaInvalidIdError } from "~/prisma/client";
import {
  fieldIsIncluded,
  type ApiSkill,
  type BrandSkill,
  type SkillIncludes,
  type BrandRepository,
} from "~/prisma/model";
import { conditionallyInclude } from "~/prisma/model";
import { conditionalFilters } from "~/prisma/util";
import { ApiClientGlobalError } from "~/api";
import { type Visibility } from "~/api/query";

export const preloadSkill = <I extends SkillIncludes>(
  id: string,
  { visibility = "public", includes }: { visibility: Visibility; includes: I },
) => {
  void getSkill(id, { visibility, includes });
};

// This method is currently not used but is being left here for future use.
export const getSkill = cache(
  async <I extends SkillIncludes>(
    id: string,
    { visibility = "public", includes }: { visibility: Visibility; includes: I },
  ): Promise<ApiSkill<I>> => {
    let skill: BrandSkill;
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });
    try {
      skill = await prisma.skill.findUniqueOrThrow({
        where: { id },
      });
    } catch (e) {
      if (isPrismaDoesNotExistError(e) || isPrismaInvalidIdError(e)) {
        throw ApiClientGlobalError.NotFound();
      }
      throw e;
    }
    if (skill.visible === false && visibility === "public") {
      throw ApiClientGlobalError.Forbidden();
    }

    const experiences = await prisma.experience.findMany({
      include: { company: true, skills: true },
      orderBy: [{ startDate: "desc" }],
      where: {
        AND: conditionalFilters([
          visibility === "public" ? { visible: true } : undefined,
          { skills: { some: { skillId: { in: [skill.id] } } } },
        ]),
      },
    });

    const educations = await prisma.education.findMany({
      orderBy: [{ startDate: "desc" }],
      include: { skills: true, school: true },
      where: {
        AND: conditionalFilters([
          visibility === "public" ? { visible: true } : undefined,
          { skills: { some: { skillId: { in: [skill.id] } } } },
        ]),
      },
    });

    const projects = await prisma.project.findMany({
      where: { skills: { some: { skillId: { in: [skill.id] } } } },
      orderBy: [{ startDate: "desc" }],
      include: { skills: true },
    });

    let repositories: BrandRepository[] = [];
    if (fieldIsIncluded("repositories", includes)) {
      repositories = await prisma.repository.findMany({
        where: { skills: { some: { id: { in: [skill.id] } } } },
        orderBy: { createdAt: "desc" },
      });
    }

    const oldestEducation = strictArrayLookup(educations, educations.length - 1, {});
    const oldestExperience = strictArrayLookup(experiences, experiences.length - 1, {});
    const oldestProject = strictArrayLookup(projects, projects.length - 1, {});
    const oldestDate = minDate(
      oldestEducation?.startDate,
      oldestExperience?.startDate,
      oldestProject?.startDate,
    );

    const autoExperience = oldestDate
      ? Math.round(DateTime.now().diff(DateTime.fromJSDate(oldestDate), "years").years)
      : 0;

    return conditionallyInclude(
      { ...skill, autoExperience, experiences, educations, projects, repositories },
      ["educations", "experiences", "projects", "repositories"],
      includes,
    );
  },
) as {
  <I extends SkillIncludes>(
    id: string,
    params: { visibility: Visibility; includes: I },
  ): Promise<ApiSkill<I>>;
};
