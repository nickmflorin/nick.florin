import type { ApiDetail, DetailIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";
import { isUuid } from "~/lib/typeguards";

import {
  constructTableSearchClause,
  getDetailsOrdering,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type DetailsControls,
  standardListFetchAction,
  type StandardFetchActionReturn,
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
} from "~/actions";

const filtersClause = ({ filters, filterIsVisible }: ActionFilterParams<DetailsControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("detail", filters.search) : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.entityTypes && filters.entityTypes.length !== 0
      ? { entityType: { in: filters.entityTypes } }
      : undefined,
    filters.entityIds && filters.entityIds.length !== 0
      ? { entityId: { in: filters.entityIds.filter(isUuid) } }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filters, filterIsVisible }: ActionFilterParams<DetailsControls>) => {
  const clause = filtersClause({ filters, filterIsVisible });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchDetailsCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<DetailsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.skill.count({ where: whereClause({ filters, filterIsVisible }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchDetailsPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<DetailsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.skill.count({
      where: whereClause({ filters, filterIsVisible }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.skill });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchDetails = <I extends DetailIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, ordering, page, limit, visibility }: Omit<DetailsControls<I>, "includes">,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiDetail<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchDetailsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const details = await db.detail.findMany({
        where: whereClause({ filters, filterIsVisible }),
        orderBy: getDetailsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
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
          nestedDetails: fieldIsIncluded("nestedDetails", includes)
            ? {
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                where: { visible: filterIsVisible(filters.visible) },
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
              }
            : undefined,
        },
      });
      return details as ApiDetail<I>[];
    },
    { authenticated: false, adminOnly: false },
  );
