import "server-only";

import { cache } from "react";

import { getClerkAuthedUser } from "~/application/auth/server";
import { type ApiSkill, type SkillIncludes, type Prisma, fieldIsIncluded } from "~/database/model";
import { prisma } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import { type SkillsFilters } from "~/actions-v2/schemas";
import { parsePagination, type ApiStandardListQuery } from "~/api/query";
import { convertToPlainObject } from "~/api/serialization";

import { PAGE_SIZES, constructTableSearchClause } from "../constants";

export type GetSkillsParams<I extends SkillIncludes> = ApiStandardListQuery<
  I,
  Partial<SkillsFilters>,
  Prisma.SkillOrderByWithRelationInput
>;

const filtersClause = (filters: Partial<SkillsFilters>) =>
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
    await getClerkAuthedUser({ strict: visibility === "admin" });
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

export const getSkills = cache(
  async <I extends SkillIncludes>({
    page,
    filters,
    visibility,
    includes,
    limit,
    orderBy = [{ label: "asc" }],
  }: GetSkillsParams<I>): Promise<ApiSkill<I>[]> => {
    await getClerkAuthedUser({ strict: visibility === "admin" });

    const pagination = await parsePagination({
      pageSize: PAGE_SIZES.skill,
      page,
      getCount: async () => await getSkillsCount({ filters, visibility }),
    });

    if (pagination !== null && limit !== undefined) {
      throw new Error("The method cannot be used with both pagination and a 'limit' parameter!");
    }

    const skills = (await prisma.skill.findMany({
      where: whereClause({ filters, visibility }),
      orderBy,
      skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
      /* If the orderBy parameter is not present, the default is to sort the skills by their
         relative experience values, which has to occur after the query is performed.  In that case,
         the limit has to be applied after the manual sorting, so it cannot be provided as a param
         here. */
      take: pagination ? pagination.pageSize : limit,
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
              orderBy: { startDate: "desc" },
            }
          : undefined,
        experiences: fieldIsIncluded("experiences", includes)
          ? {
              where: { visible: visibility === "public" ? true : undefined },
              include: { company: true },
              orderBy: { startDate: "desc" },
            }
          : undefined,
      },
    })) as ApiSkill<I>[];

    return skills.map(convertToPlainObject);
  },
) as <I extends SkillIncludes>(params: GetSkillsParams<I>) => Promise<ApiSkill<I>[]>;
