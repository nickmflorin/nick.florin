import "server-only";
import { cache } from "react";

import { DateTime } from "luxon";

import { getAuthAdminUser } from "~/application/auth";
import { strictArrayLookup, minDate } from "~/lib";
import { prisma } from "~/prisma/client";
import {
  type BrandSkill,
  type ApiSkill,
  type ApiProject,
  type ApiEducation,
  type SkillCategory,
  type ProgrammingLanguage,
  type ProgrammingDomain,
  type SkillIncludes,
  type ApiExperience,
  fieldIsIncluded,
} from "~/prisma/model";
import { conditionalFilters } from "~/prisma/util";
import { parsePagination } from "~/api/query";
import { type Visibility } from "~/api/query";

import { convertToPlainObject } from "../../../api/serialization";
import { PAGE_SIZES, constructTableSearchClause } from "../constants";

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
  readonly visibility: Visibility;
  readonly filters?: GetSkillsFilters;
  readonly page?: number;
  readonly includes: I;
};

const filtersClause = (filters: GetSkillsFilters) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("skill", filters.search) : undefined,
    filters.educations && filters.educations.length !== 0
      ? { educations: { some: { id: { in: filters.educations } } } }
      : undefined,
    filters.experiences && filters.experiences.length !== 0
      ? { experiences: { some: { id: { in: filters.experiences } } } }
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
    visibility,
  }: Omit<GetSkillsParams<I>, "page" | "includes">) => {
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

export const includeAutoExperience = <T extends BrandSkill>({
  skill,
  educations: _educations,
  experiences: _experiences,
  projects: _projects,
}: {
  readonly skill: T;
  readonly projects: ApiProject<["skills"]>[];
  readonly educations: ApiEducation<["skills"]>[];
  readonly experiences: ApiExperience<["skills"]>[];
}): T & { readonly autoExperience: number } => {
  const educations = _educations.filter(edu => edu.skills.some(s => s.id === skill.id));
  const experiences = _experiences.filter(exp => exp.skills.some(s => s.id === skill.id));
  const projects = _projects.filter(p => p.skills.some(s => s.id === skill.id));

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
    visibility,
    includes,
  }: GetSkillsParams<I>): Promise<ApiSkill<I>[]> => {
    await getAuthAdminUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      pageSize: PAGE_SIZES.skill,
      page,
      getCount: async () => await getSkillsCount({ filters, visibility }),
    });

    const skills = (await prisma.skill.findMany({
      where: whereClause({ filters, visibility }),
      orderBy: { createdAt: "desc" },
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      take: pagination ? pagination.pageSize : undefined,
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
    })) as ApiSkill<I>[];

    const projects = await prisma.project.findMany({
      where: { skills: { some: { id: { in: skills.map(sk => sk.id) } } } },
      include: { skills: true },
    });

    const experiences = await prisma.experience.findMany({
      where: { skills: { some: { id: { in: skills.map(sk => sk.id) } } } },
      include: { skills: true, company: true },
    });

    const educations = await prisma.education.findMany({
      where: { skills: { some: { id: { in: skills.map(sk => sk.id) } } } },
      include: { skills: true, school: true },
    });

    return skills.map(skill =>
      convertToPlainObject(includeAutoExperience({ skill, experiences, educations, projects })),
    );
  },
) as <I extends SkillIncludes>(params: GetSkillsParams<I>) => Promise<ApiSkill<I>[]>;
