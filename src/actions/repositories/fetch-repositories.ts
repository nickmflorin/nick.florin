import type { ApiRepository, RepositoryIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  getRepositoriesOrdering,
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type RepositoriesControls,
  standardListFetchAction,
  type StandardFetchActionReturn,
  type ActionCountParams,
  type ActionFilterParams,
  type ActionPaginationParams,
} from "~/actions";

const filtersClause = ({ filters, filterIsVisible }: ActionFilterParams<RepositoriesControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("repository", filters.search) : undefined,
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

const whereClause = ({ filters, filterIsVisible }: ActionFilterParams<RepositoriesControls>) => {
  const clause = filtersClause({ filters, filterIsVisible });
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
      where: whereClause({ filters, filterIsVisible }),
    });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchRepositoriesPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<RepositoriesControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.repository.count({
      where: whereClause({ filters, filterIsVisible }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.repository });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchRepositories = <I extends RepositoryIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, ordering, page, limit, visibility }: Omit<RepositoriesControls<I>, "includes">,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiRepository<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchRepositoriesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const repositories = await db.repository.findMany({
        where: whereClause({ filters, filterIsVisible }),
        include: {
          projects: fieldIsIncluded("projects", includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getRepositoriesOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      });

      return repositories as ApiRepository<I>[];
    },
    { authenticated: false, adminOnly: false },
  );
