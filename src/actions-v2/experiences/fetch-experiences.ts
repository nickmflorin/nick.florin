import type { ApiExperience, ExperienceIncludes } from "~/database/model";
import { DetailEntityType, fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  getExperiencesOrdering,
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type ExperiencesControls,
  standardListFetchAction,
  type StandardFetchActionReturn,
  type ActionCountParams,
  type ActionPaginationParams,
  type ActionFilterParams,
} from "~/actions-v2";

const filtersClause = ({ filters, filterIsVisible }: ActionFilterParams<ExperiencesControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("experience", filters.search) : undefined,
    filters.companies && filters.companies.length !== 0
      ? { companyId: { in: filters.companies } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filters, filterIsVisible }: ActionFilterParams<ExperiencesControls>) => {
  const clause = filtersClause({ filters, filterIsVisible });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchExperiencesCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<ExperiencesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.experience.count({ where: whereClause({ filters, filterIsVisible }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchExperiencesPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<ExperiencesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.experience.count({
      where: whereClause({ filters, filterIsVisible }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.experience });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchExperiences = <I extends ExperienceIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, ordering, page, limit, visibility }: Omit<ExperiencesControls<I>, "includes">,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiExperience<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchExperiencesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const experiences = await db.experience.findMany({
        where: whereClause({ filters, filterIsVisible }),
        include: {
          company: true,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getExperiencesOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      });

      if (fieldIsIncluded("details", includes)) {
        const details = await db.detail.findMany({
          where: {
            entityType: DetailEntityType.EXPERIENCE,
            entityId: { in: experiences.map(e => e.id) },
            visible: filterIsVisible(filters.visible),
          },
          include: {
            project: {
              include: {
                skills: fieldIsIncluded("skills", includes)
                  ? { where: { visible: filterIsVisible(filters.visible) } }
                  : undefined,
              },
            },
            skills: fieldIsIncluded("skills", includes)
              ? { where: { visible: filterIsVisible(filters.visible) } }
              : undefined,
            nestedDetails: {
              orderBy: [{ createdAt: "desc" }, { id: "desc" }],
              where: {
                visible: filterIsVisible(filters.visible),
              },
              include: {
                skills: fieldIsIncluded("skills", includes)
                  ? { where: { visible: filterIsVisible(filters.visible) } }
                  : undefined,
                project: {
                  include: {
                    skills: fieldIsIncluded("skills", includes)
                      ? { where: { visible: filterIsVisible(filters.visible) } }
                      : undefined,
                  },
                },
              },
            },
          },
        });
        return experiences.map(
          (edu): ApiExperience<I> =>
            ({ ...edu, details: details.filter(d => d.entityId === edu.id) }) as ApiExperience<I>,
        );
      }
      return experiences as ApiExperience<I>[];
    },
    { authenticated: false, adminOnly: false },
  );
