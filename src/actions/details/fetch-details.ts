import { type ApiDetail, type DetailIncludes, fieldIsIncluded } from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';
import { isUuid } from '~/lib/typeguards';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  constructTableSearchClause,
  type DetailsControls,
  getDetailsOrdering,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({ filterIsVisible, filters }: ActionFilterParams<DetailsControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('detail', filters.search) : undefined,
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

const whereClause = ({ filterIsVisible, filters }: ActionFilterParams<DetailsControls>) => {
  const clause = filtersClause({ filterIsVisible, filters });
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
    const count = await db.skill.count({ where: whereClause({ filterIsVisible, filters }) });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchDetailsPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<DetailsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.skill.count({
      where: whereClause({ filterIsVisible, filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.skill });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchDetails = <I extends DetailIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<DetailsControls<I>, 'includes'>,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiDetail<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchDetailsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const details = await db.detail.findMany({
        include: {
          nestedDetails: fieldIsIncluded('nestedDetails', includes)
            ? {
                include: {
                  project: {
                    include: {
                      skills: fieldIsIncluded('skills', includes)
                        ? { where: { visible: filterIsVisible(filters.visible) } }
                        : undefined,
                    },
                  },
                  skills: fieldIsIncluded('skills', includes)
                    ? { where: { visible: filterIsVisible(filters.visible) } }
                    : undefined,
                },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                where: { visible: filterIsVisible(filters.visible) },
              }
            : undefined,
          project: {
            include: {
              skills: fieldIsIncluded('skills', includes)
                ? { where: { visible: filterIsVisible(filters.visible) } }
                : undefined,
            },
          },
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getDetailsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        where: whereClause({ filterIsVisible, filters }),
      });
      return details as ApiDetail<I>[];
    },
    { adminOnly: false, authenticated: false },
  );
