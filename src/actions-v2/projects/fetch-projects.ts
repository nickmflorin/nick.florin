import type { ApiProject, ProjectIncludes } from "~/database/model";
import { fieldIsIncluded } from "~/database/model";
import { db } from "~/database/prisma";
import { conditionalFilters } from "~/database/util";

import {
  constructTableSearchClause,
  PAGE_SIZES,
  type ServerSidePaginationParams,
  clampPagination,
  type ProjectsControls,
  standardListFetchAction,
  getProjectsOrdering,
  type StandardFetchActionReturn,
  type ActionPaginationParams,
  type ActionCountParams,
  type ActionFilterParams,
} from "~/actions-v2";

const filtersClause = ({ filters, filterIsVisible }: ActionFilterParams<ProjectsControls>) =>
  conditionalFilters([
    filters.search ? constructTableSearchClause("project", filters.search) : undefined,
    filters.repositories && filters.repositories.length !== 0
      ? { repositories: { some: { id: { in: filters.repositories } } } }
      : undefined,
    filters.skills && filters.skills.length !== 0
      ? { skills: { some: { id: { in: filters.skills } } } }
      : undefined,
    filters.highlighted !== undefined && filters.highlighted !== null
      ? { highlighted: filters.highlighted }
      : undefined,
    { visible: filterIsVisible(filters.visible) },
  ] as const);

const whereClause = ({ filters, filterIsVisible }: ActionFilterParams<ProjectsControls>) => {
  const clause = filtersClause({ filters, filterIsVisible });
  if (clause.length !== 0) {
    return { AND: [...clause] };
  }
  return {};
};

export const fetchProjectsCount = standardListFetchAction(
  async (
    { filters }: ActionCountParams<ProjectsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<{
    count: number;
  }> => {
    const count = await db.project.count({ where: whereClause({ filters, filterIsVisible }) });
    return { count };
  },
  { authenticated: true, adminOnly: true },
);

export const fetchProjectsPagination = standardListFetchAction(
  async (
    { filters, page }: ActionPaginationParams<ProjectsControls>,
    { filterIsVisible },
  ): StandardFetchActionReturn<ServerSidePaginationParams> => {
    const count = await db.project.count({
      where: whereClause({ filters, filterIsVisible }),
    });
    return clampPagination({ count, page, pageSize: PAGE_SIZES.project });
  },
  { authenticated: true, adminOnly: true },
);

export const fetchProjects = <I extends ProjectIncludes>(includes: I) =>
  standardListFetchAction(
    async (
      { filters, ordering, page, limit, visibility }: Omit<ProjectsControls<I>, "includes">,
      { filterIsVisible },
    ): StandardFetchActionReturn<ApiProject<I>[]> => {
      let pagination: Omit<ServerSidePaginationParams, "count"> | null = null;
      if (page !== undefined) {
        ({ data: pagination } = await fetchProjectsPagination(
          { filters, page, visibility },
          { strict: true },
        ));
      }

      let projects = (await db.project.findMany({
        where: whereClause({ filters, filterIsVisible }),
        include: {
          skills: fieldIsIncluded("skills", includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
          repositories: fieldIsIncluded("repositories", includes)
            ? { where: { visible: filterIsVisible(filters.visible) } }
            : undefined,
        },
        orderBy: getProjectsOrdering(ordering),
        skip: pagination ? pagination.pageSize * (pagination.page - 1) : undefined,
        take: pagination ? pagination.pageSize : limit,
      })) as ApiProject<I>[];

      if (fieldIsIncluded("nestedDetails", includes)) {
        const nestedDetails = await db.nestedDetail.findMany({
          where: { projectId: { in: projects.map(p => p.id) } },
        });
        projects = projects.map(
          (proj): ApiProject<I> =>
            ({
              ...proj,
              nestedDetails: nestedDetails.filter(d => d.projectId === proj.id),
            }) as ApiProject<I>,
        );
      }

      if (fieldIsIncluded("details", includes)) {
        const details = await db.detail.findMany({
          where: { projectId: { in: projects.map(p => p.id) } },
        });
        projects = projects.map(
          (proj): ApiProject<I> =>
            ({ ...proj, details: details.filter(d => d.projectId === proj.id) }) as ApiProject<I>,
        );
      }
      return projects;
    },
    { authenticated: false, adminOnly: false },
  );
