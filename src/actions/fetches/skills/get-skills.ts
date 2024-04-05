import "server-only";
import { cache } from "react";

import { DateTime } from "luxon";

import { getAuthAdminUser } from "~/application/auth";
import { strictArrayLookup, minDate } from "~/lib";
import { prisma } from "~/prisma/client";
import {
  type Skill,
  type ApiSkill,
  type Experience,
  type Education,
  type Company,
  type School,
  type EducationOnSkills,
  type ExperienceOnSkills,
  type SkillCategory,
  type ProgrammingLanguage,
  type ProgrammingDomain,
  type SkillIncludes,
  type Project,
  type ProjectOnSkills,
  conditionallyInclude,
} from "~/prisma/model";
import { constructOrSearch, conditionalFilters } from "~/prisma/util";
import { parsePagination } from "~/api/query";
import { type Visibility } from "~/api/query";

import { SKILLS_ADMIN_TABLE_PAGE_SIZE } from "../constants";

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

type GetSkillsParams<I extends SkillIncludes> = {
  readonly visibility?: Visibility;
  readonly filters?: GetSkillsFilters;
  readonly page?: number;
  readonly includes: I;
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

const whereClause = <I extends SkillIncludes>({
  filters,
  visibility,
}: Pick<GetSkillsParams<I>, "visibility" | "filters">) =>
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

export const preloadSkillsCount = <I extends SkillIncludes>(
  params: Omit<GetSkillsParams<I>, "page">,
) => {
  void getSkillsCount(params);
};

export const getSkillsCount = cache(
  async <I extends SkillIncludes>({
    filters,
    visibility = "public",
  }: Omit<GetSkillsParams<I>, "page" | "includes">) => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });
    return await prisma.skill.count({
      where: whereClause({ filters, visibility }),
    });
  },
) as <I extends SkillIncludes>(
  params: Omit<GetSkillsParams<I>, "page" | "includes">,
) => Promise<number>;

export const preloadSkills = <I extends SkillIncludes>(params: GetSkillsParams<I>) => {
  void getSkills(params);
};

export const toApiSkill = ({
  skill,
  educations: _educations,
  experiences: _experiences,
  projects: _projects,
}: {
  readonly skill: Skill;
  readonly projects: (Project & {
    readonly skills: ProjectOnSkills[];
  })[];
  readonly educations: (Education & {
    readonly skills: EducationOnSkills[];
    readonly school: School;
  })[];
  readonly experiences: (Experience & {
    readonly skills: ExperienceOnSkills[];
    readonly company: Company;
  })[];
}): ApiSkill<["experiences", "educations", "projects"]> => {
  const educations = _educations.filter(edu => edu.skills.some(s => s.skillId === skill.id));
  const experiences = _experiences.filter(exp => exp.skills.some(s => s.skillId === skill.id));
  const projects = _projects.filter(p => p.skills.some(s => s.skillId === skill.id));

  const oldestEducation = strictArrayLookup(educations, educations.length - 1, {});
  const oldestExperience = strictArrayLookup(experiences, experiences.length - 1, {});
  const oldestProject = strictArrayLookup(projects, projects.length - 1, {});
  const oldestDate = minDate(
    oldestEducation?.startDate,
    oldestExperience?.startDate,
    oldestProject?.startDate,
  );

  return {
    ...skill,
    autoExperience: oldestDate
      ? Math.round(DateTime.now().diff(DateTime.fromJSDate(oldestDate), "years").years)
      : 0,
    experiences,
    educations,
    projects,
  };
};

export const getSkills = cache(
  async <I extends SkillIncludes>({
    page,
    filters,
    visibility = "public",
    includes,
  }: GetSkillsParams<I>): Promise<ApiSkill<I>[]> => {
    /* TODO: We have to figure out how to get this to render an API response, instead of throwing
       a hard error, in the case that this is being called from the context of a route handler. */
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      pageSize: SKILLS_ADMIN_TABLE_PAGE_SIZE,
      page,
      getCount: async () => await getSkillsCount({ filters, visibility }),
    });

    const skills = await prisma.skill.findMany({
      where: whereClause({ filters, visibility }),
      orderBy: { createdAt: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
    });

    const projects = await prisma.project.findMany({
      where: { skills: { some: { skillId: { in: skills.map(sk => sk.id) } } } },
      orderBy: [{ startDate: "desc" }],
      include: { skills: true },
    });

    const experiences = await prisma.experience.findMany({
      include: { company: true, skills: true },
      orderBy: [{ startDate: "desc" }],
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
      orderBy: [{ startDate: "desc" }],
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

    return skills.map((skill): ApiSkill<I> => {
      const apiSKill = toApiSkill({
        skill,
        educations,
        experiences,
        projects,
      });
      return conditionallyInclude(apiSKill, ["educations", "experiences", "projects"], includes);
    });
  },
) as <I extends SkillIncludes>(params: GetSkillsParams<I>) => Promise<ApiSkill<I>[]>;
