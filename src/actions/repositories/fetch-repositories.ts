import { type ApiRepository, fieldIsIncluded, type RepositoryIncludes } from '~/database/model';
import { db } from '~/database/prisma';
import { conditionalFilters } from '~/database/util';

import {
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
  clampPagination,
  constructTableSearchClause,
  getRepositoriesOrdering,
  PAGE_SIZES,
  type RepositoriesControls,
  type ServerSidePaginationParams,
  type StandardFetchActionReturn,
  standardListFetchAction,
} from '~/actions';

const filtersClause = ({ filterIsVisible, filters }: ActionFilterParams<RepositoriesControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause('repository', filters.search) : undefined,
    filters.projects && filters.projects.length !== 0
      ? { projects: { some: { id: { in: filters.projects } } } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filterIsVisible, filters }: ActionFilterParams<RepositoriesControls>) => {
  const clause = filtersClause({ filterIsVisible, filters });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchRepositoriesCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<RepositoriesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.repository.count({
      where: whereClause({ filterIsVisible, filters }),
    });
    return { count };
  },
  { adminOnly: true, authenticated: true },
);

export const fetchRepositoriesPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<RepositoriesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.repository.count({
      where: whereClause({ filterIsVisible, filters }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.repository });
  },
  { adminOnly: true, authenticated: true },
);

export const fetchRepositories = <I extends RepositoryIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, limit, ordering, page, visibility }: Omit<RepositoriesControls<I>, 'includes'>,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiRepository<I>[]> => {
      let pagination: null | Omit<ServerSidePaginationParams, 'count'> = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchRepositoriesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const repositories = await db.repository.findMany({
        include: {
          projects: fieldIsIncluded('projects', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
          skills: fieldIsIncluded('skills', includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getRepositoriesOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
        where: whereClause({ filterIsVisible, filters }),
      });

      return repositories as ApiRepository<I>[];
    },
    { adminOnly: false, authenticated: false },
  );
