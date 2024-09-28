import { type Required } from "utility-types";

import type { ApiSkill, SkillIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  visibilityIsAdmin,
  getSkillsOrdering,
  isVisible,
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type SkillsControls,
  standardListFetchAction,
  type StandardFetchActionReturn,
} from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

const filtersClause = ({ filters, visibility }: Pick<SkillsControls, "filters" | "visibility">) =>
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
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    filters.prioritized !== undefined && filters.prioritized !== null
      ? { prioritized: filters.prioritized }
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
    { visible: isVisible(visibility, filters.visible) },
  ] as const);

const whereClause = ({ filters, visibility }: Pick<SkillsControls, "filters" | "visibility">) => {
  const clause = filtersClause({ filters, visibility });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchSkillsCount = standardListFetchAction(
  async ({
    filters,
    visibility,
  }: Pick<SkillsControls, "filters" | "visibility">): StandardFetchActionReturn<{
    count: number;
  }> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.skill.count({ where: whereClause({ filters, visibility }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchSkillsPagination = standardListFetchAction(
  async ({
    filters,
    page,
    visibility,
  }: Required<
    Pick<SkillsControls, "filters" | "visibility" | "page">,
    "page"
  >): StandardFetchActionReturn<ServerSidePaginationParams> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.skill.count({
      where: whereClause({ filters, visibility }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.skill });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchSkills = <I extends SkillIncludes>(includes: I) =>
  standardListFetchAction(
    async ({
      filters,
      ordering,
      page,
      limit,
      visibility,
    }: Omit<SkillsControls<I>, "includes">): StandardFetchActionReturn<ApiSkill<I>[]> => {
      if (!visibilityIsAdmin(visibility) && filters.visible === false) {
        return ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchSkillsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }
      return (await db.skill.findMany({
        where: whereClause({ filters, visibility }),
        orderBy: getSkillsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination
          ? pagination.pageSize
          : limit !== undefined && limit !== 0
            ? limit
            : undefined,
        include: {
          courses: fieldIsIncluded("courses", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
          repositories: fieldIsIncluded("repositories", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
          projects: fieldIsIncluded("projects", includes),
          educations: fieldIsIncluded("educations", includes)
            ? {
                where: {
                  visible: isVisible(visibility, filters.visible),
                },
                include: { school: true },
                orderBy: { startDate: "desc" },
              }
            : undefined,
          experiences: fieldIsIncluded("experiences", includes)
            ? {
                where: { visible: isVisible(visibility, filters.visible) },
                include: { company: true },
                orderBy: { startDate: "desc" },
              }
            : undefined,
        },
      })) as ApiSkill<I>[];
    },
    { authenticated: false, adminOnly: false },
  );
