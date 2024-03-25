import "server-only";
import { cache } from "react";

import { DateTime } from "luxon";

import { getAuthAdminUser } from "~/application/auth";
import { strictArrayLookup, minDate } from "~/lib";
import { prisma } from "~/prisma/client";
import {
  type Skill,
  type ApiSkill,
  type EducationOnSkills,
  type Experience,
  type Education,
  type Company,
  type School,
  type ExperienceOnSkills,
  type SkillCategory,
  type ProgrammingLanguage,
  type ProgrammingDomain,
} from "~/prisma/model";
import { constructOrSearch, conditionalFilters } from "~/prisma/util";

import { parsePagination } from "../pagination";
import { type Visibility } from "../visibility";

import { SKILLS_ADMIN_TABLE_PAGE_SIZE } from "./constants";

const SEARCH_FIELDS = ["slug", "label"] as const;

export type GetSkillsFilters = {
  readonly educations?: string[];
  readonly experiences?: string[];
  readonly search?: string;
  readonly includeInTopSkills?: boolean;
  readonly categories?: SkillCategory[];
  readonly programmingLanguages?: ProgrammingLanguage[];
  readonly programmingDomains?: ProgrammingDomain[];
};

type GetSkillsParams = {
  readonly visibility?: Visibility;
  readonly filters?: GetSkillsFilters;
  readonly page?: number;
};

const filtersClause = (filters: GetSkillsFilters) =>
  conditionalFilters([
    filters.search ? constructOrSearch(filters.search, [...SEARCH_FIELDS]) : undefined,
    filters.educations && filters.educations.length !== 0
      ? {
          educations: { some: { educationId: { in: filters.educations } } },
        }
      : undefined,
    filters.experiences && filters.experiences.length !== 0
      ? {
          experiences: { some: { experienceId: { in: filters.experiences } } },
        }
      : undefined,
    filters.includeInTopSkills !== undefined
      ? { includeInTopSkills: filters.includeInTopSkills }
      : undefined,
    filters.programmingDomains && filters.programmingDomains.length !== 0
      ? { programmingDomains: { hasSome: filters.programmingDomains } }
      : undefined,
    filters.programmingLanguages && filters.programmingLanguages.length !== 0
      ? { programmingLanguages: { hasSome: filters.programmingLanguages } }
      : undefined,
    filters.categories && filters.categories.length !== 0
      ? { categories: { hasSome: filters.categories } }
      : undefined,
  ] as const);

const whereClause = ({ filters, visibility }: Pick<GetSkillsParams, "visibility" | "filters">) =>
  ({
    AND:
      filters && visibility === "public"
        ? [...filtersClause(filters), { visible: true }]
        : filters
          ? filtersClause(filters)
          : visibility === "public"
            ? { visible: true }
            : undefined,
  }) as const;

export const preloadSkillsCount = (params: Omit<GetSkillsParams, "page">) => {
  void getSkillsCount(params);
};

export const getSkillsCount = cache(
  async ({ filters, visibility = "public" }: Omit<GetSkillsParams, "page">) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });
    return await prisma.skill.count({
      where: whereClause({ filters, visibility }),
    });
  },
);

export const preloadSkills = (params: GetSkillsParams) => {
  void getSkills(params);
};

export const toApiSkill = ({
  skill,
  educations,
  experiences,
}: {
  skill: Skill;
  educations: (Education & { readonly skills: EducationOnSkills[]; readonly school: School })[];
  experiences: (Experience & {
    readonly skills: ExperienceOnSkills[];
    readonly company: Company;
  })[];
}): ApiSkill => {
  const apiSkill = {
    ...skill,
    educations: educations.filter(edu => edu.skills.some(s => s.skillId === skill.id)),
    experiences: experiences.filter(exp => exp.skills.some(s => s.skillId === skill.id)),
  };
  const oldestEducation = strictArrayLookup(
    apiSkill.educations,
    apiSkill.educations.length - 1,
    {},
  );
  const oldestExperience = strictArrayLookup(
    apiSkill.experiences,
    apiSkill.experiences.length - 1,
    {},
  );
  const oldestDate = minDate(oldestEducation?.startDate, oldestExperience?.startDate);
  return {
    ...apiSkill,
    autoExperience: oldestDate
      ? Math.round(DateTime.now().diff(DateTime.fromJSDate(oldestDate), "years").years)
      : 0,
  };
};

export const getSkills = cache(
  async ({ page, filters, visibility = "public" }: GetSkillsParams) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      pageSize: SKILLS_ADMIN_TABLE_PAGE_SIZE,
      page,
      filters,
      visibility,
      getCount: getSkillsCount,
    });

    const skills = await prisma.skill.findMany({
      where: whereClause({ filters, visibility }),
      orderBy: { createdAt: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });

    const experiences = await prisma.experience.findMany({
      include: { company: true, skills: true },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      where: {
        AND: conditionalFilters([
          visibility === "public" ? { visible: true } : undefined,
          {
            skills: {
              some: { skillId: { in: skills.map(sk => sk.id) } },
            },
          },
        ]),
      },
    });

    const educations = await prisma.education.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { skills: true, school: true },
      where: {
        AND: conditionalFilters([
          visibility === "public" ? { visible: true } : undefined,
          {
            skills: {
              some: { skillId: { in: skills.map(sk => sk.id) } },
            },
          },
        ]),
      },
    });

    return skills.map(skill => toApiSkill({ skill, educations, experiences }));
  },
);
