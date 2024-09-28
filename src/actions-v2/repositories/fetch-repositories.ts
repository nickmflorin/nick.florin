import { type Required } from "utility-types";

import type { ApiRepository, RepositoryIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import { getRepositoriesOrdering, visibilityIsAdmin } from "~/actions-v2";
import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  isVisible,
  clampPagination,
  type RepositoriesControls,
  standardListFetchAction,
  type StandardFetchActionReturn,
} from "~/actions-v2";
import { ApiClientGlobalError } from "~/api-v2";

const filtersClause = ({
  filters,
  visibility,
}: Pick<RepositoriesControls, "filters" | "visibility">) =>
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
    { visible: isVisible(visibility, filters.visible) },
  ] as const);

const whereClause = ({
  filters,
  visibility,
}: Pick<RepositoriesControls, "filters" | "visibility">) => {
  const clause = filtersClause({ filters, visibility });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchRepositoriesCount = standardListFetchAction(
  async ({
    filters,
    visibility,
  }: Pick<RepositoriesControls, "filters" | "visibility">): StandardFetchActionReturn<{
    count: number;
  }> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.repository.count({ where: whereClause({ filters, visibility }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchRepositoriesPagination = standardListFetchAction(
  async ({
    filters,
    page,
    visibility,
  }: Required<
    Pick<RepositoriesControls, "filters" | "visibility" | "page">,
    "page"
  >): StandardFetchActionReturn<ServerSidePaginationParams> => {
    /* This check may be redundant, because of the 'adminOnly' flag in the standard fetch action
       method - but we want to include this just in case. */
    if (!visibilityIsAdmin(visibility) && filters.visible === false) {
      return ApiClientGlobalError.Forbidden({
        message: "The user does not have permission to access this data.",
      });
    }
    const count = await db.repository.count({
      where: whereClause({ filters, visibility }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.repository });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchRepositories = <I extends RepositoryIncludes>(includes: I) =>
  standardListFetchAction(
    async ({
      filters,
      ordering,
      page,
      limit,
      visibility,
    }: Omit<RepositoriesControls<I>, "includes">): StandardFetchActionReturn<
      ApiRepository<I>[]
    > => {
      if (!visibilityIsAdmin(visibility) && filters.visible === false) {
        return ApiClientGlobalError.Forbidden({
          message: "The user does not have permission to access this data.",
        });
      }
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchRepositoriesPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      const repositories = await db.repository.findMany({
        where: whereClause({ filters, visibility }),
        include: {
          projects: fieldIsIncluded("projects", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
            : undefined,
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: isVisible(visibility, filters.visible) } }
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
