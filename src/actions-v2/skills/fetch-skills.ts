import { type Required } from "utility-types";

import type { ApiSkill, SkillIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type SkillsControls,
  standardFetchAction,
  type StandardFetchActionReturn,
} from "~/actions-v2";

const filtersClause = ({ filters }: Pick<SkillsControls, "filters">) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("skill", filters.search) : undefined,
    filters.educations && filters.educations.length !== 0
      ? { educations: { some: { id: { in: filters.educations } } } }
      : undefined,
    filters.experiences && filters.experiences.length !== 0
      ? { experiences: { some: { id: { in: filters.experiences } } } }
      : undefined,
    filters.repositories && filters.repositories.length !== 0
      ? { repositories: { some: { id: { in: filters.repositories } } } }
      : undefined,
    filters.projects && filters.projects.length !== 0
      ? { projects: { some: { id: { in: filters.projects } } } }
      : undefined,
    filters.includeInTopSkills !== undefined && filters.includeInTopSkills !== null
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

const whereClause = ({
  filters,
  visibility,
}: Required<Pick<SkillsControls, "filters" | "visibility">, "visibility">) => {
  const clause = filtersClause({ filters });
  if (clause.length !== 0) {
    if (visibility === "public") {
      return { AND: [...clause, { visible: true }] };
    }
    return { AND: [...clause] };
  }
  return visibility === "public" ? { visible: true } : {};
};

export const fetchSkillsCount = standardFetchAction(
  async ({
    filters,
    visibility,
  }: Required<
    Pick<SkillsControls, "filters" | "visibility">,
    "visibility"
  >): StandardFetchActionReturn<{ count: number }> => {
    const count = await db.skill.count({ where: whereClause({ filters, visibility }) });
    return { count };
  },
);

export const fetchSkillsPagination = standardFetchAction(
  async ({
    filters,
    page,
    visibility,
  }: Required<
    Pick<SkillsControls, "filters" | "visibility" | "page">,
    "page" | "visibility"
  >): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.skill.count({
      where: whereClause({ filters, visibility }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.skill });
  },
);

export const fetchSkills = <I extends SkillIncludes>(includes: I) =>
  standardFetchAction(
    async ({
      filters,
      ordering,
      page,
      limit,
      visibility,
    }: Omit<SkillsControls<I>, "includes">): StandardFetchActionReturn<ApiSkill<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchSkillsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }
      return (await db.skill.findMany({
        where: whereClause({ filters, visibility }),
        orderBy: ordering ? [{ [ordering.orderBy]: ordering.order }] : undefined,
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination
          ? pagination.pageSize
          : limit !== undefined && limit !== 0
            ? limit
            : undefined,
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
    },
  );
